-- ==========================================
-- FUNCION RPC PARA TRANSACCIONES DEL KARDEX
-- ==========================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para evitar problemas de concurrencia al actualizar el stock.

CREATE OR REPLACE FUNCTION registrar_movimiento(
  p_producto_id UUID,
  p_tipo_movimiento VARCHAR,
  p_cantidad NUMERIC,
  p_observaciones TEXT
)
RETURNS JSON AS $$
DECLARE
  v_stock_actual NUMERIC;
  v_nuevo_stock NUMERIC;
  v_movimiento_id UUID;
BEGIN
  -- 1. Bloquear el producto para lectura/escritura concurrente (previene que 2 cajeros vendan al mismo tiempo y se pisen)
  SELECT stock_actual INTO v_stock_actual
  FROM productos
  WHERE id = p_producto_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  -- 2. Calcular nuevo stock basándose en el tipo de movimiento
  IF p_tipo_movimiento IN ('INGRESO', 'SALDO_INICIAL') THEN
    v_nuevo_stock := v_stock_actual + p_cantidad;
  ELSIF p_tipo_movimiento = 'EGRESO' THEN
    v_nuevo_stock := v_stock_actual - p_cantidad;
    -- Si se quiere evitar stock negativo, se podría descomentar esto:
    -- IF v_nuevo_stock < 0 THEN RAISE EXCEPTION 'Stock insuficiente para el egreso'; END IF;
  ELSE
    RAISE EXCEPTION 'Tipo de movimiento inválido';
  END IF;
  
  -- 3. Actualizar el stock guardado en la tabla del producto
  UPDATE productos
  SET stock_actual = v_nuevo_stock
  WHERE id = p_producto_id;
  
  -- 4. Registrar el movimiento en el historial
  INSERT INTO movimientos_kardex (
    producto_id, 
    tipo_movimiento, 
    cantidad, 
    stock_resultante, 
    observaciones
  ) VALUES (
    p_producto_id, 
    p_tipo_movimiento, 
    p_cantidad, 
    v_nuevo_stock, 
    p_observaciones
  ) RETURNING id INTO v_movimiento_id;
  
  -- 5. Retornar éxito
  RETURN json_build_object(
    'success', true,
    'movimiento_id', v_movimiento_id,
    'nuevo_stock', v_nuevo_stock
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
