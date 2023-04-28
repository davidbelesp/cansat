<?php
require "config.php";
class MiConexion{
    private $conexion;
    public function __construct(){
        try{
            $this->conexion = mysqli_connect(HOST_DB,USERNAME_DB,PASSWORD_DB,NAME_DB);
        }catch(Exception $e){
            echo "Error al conectar con la base de datos";
        }
    }
    public function getConexion(){
        return $this->conexion;
    }
}

?>