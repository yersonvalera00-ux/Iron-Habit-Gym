<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SocioController extends Controller
{
    public function actualizar(Request $request, int $id)
    {
        // 1. Buscar el socio directamente en la tabla usando el campo id_socio
        $socio = DB::table('socios')->where('id_socio', $id)->first();

        if (!$socio) {
            return response()->json([
                'status' => 'error',
                'message' => 'Socio no encontrado'
            ], 404);
        }

        // 2. Actualizar los campos enviados en la petición
        // $request->all() toma automáticamente todo lo que envíes en el JSON de Postman
        DB::table('socios')->where('id_socio', $id)->update($request->all());

        // 3. Obtener el registro ya actualizado para retornarlo
        $socioActualizado = DB::table('socios')->where('id_socio', $id)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Socio actualizado correctamente',
            'data' => $socioActualizado
        ], 200);
    }
}