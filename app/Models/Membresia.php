<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membresia extends Model
{
    protected $fillable = [
        'tipo',
        'precio',
        'duracion_dias',
    ];
}
