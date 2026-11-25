<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SocioController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



// Ruta para actualizar un socio por su ID
Route::put('/socios/{id}', [SocioController::class, 'actualizar']);