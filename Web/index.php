
<?php
require "MiConexion.php";
$mi_conexion = new MiConexion();

$miQuery = "Select * from datos";
$resultado = $mi_conexion->getConexion()->query($miQuery);

//BUCLE PARA LA API
echo '{"datos":[';
$primer=true;
while($columna =$resultado->fetch_assoc()){
    if($primer){$primer=false;}else{echo ",";};
    echo "{";
    echo '"ID"'.":".$columna["ID"].",";
    echo '"temp"'.":".$columna["TEMP"].",";
    echo '"angulo"'.":".$columna["ANGULO"].",";
    echo '"humedad"'.":".$columna["HUMEDAD"]."";
    echo "}";
}
echo "]}";

$mi_conexion=null;
$resultado->close();


?>