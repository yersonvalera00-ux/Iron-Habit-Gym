<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Socio extends Model
{
    use HasFactory;

    protected $table = 'socios'; //Nombre de la tabla en MySQL
    protected $primaryKey = 'id_socio'; //llave primaria
    public $timestamps = false; // Desactiva created_at y updated_at

    //Los campos que se permiten actualizar
    protected $fillable =[
        'nombre_completo', 'telefono', 'email', 'membresia', 
        'fecha_ingreso', 'estado', 'peso', 'estatura', 
        'grasa', 'musculo', 'antecedentes'
    ];
}
