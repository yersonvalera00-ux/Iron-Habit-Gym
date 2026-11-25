<?php

namespace Database\Seeders;

use App\Models\Membresia;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Carga el catálogo de planes y los usuarios iniciales. */
    public function run(): void
    {
        // Precios de la landing. El plan diario es un valor de ejemplo: ajústalo.
        $planes = [
            ['Plan Diario', 10000, 1],
            ['Plan Mensual General', 90000, 30],
            ['Plan Trimestral', 240000, 90],
            ['Plan Anual VIP', 864000, 365],
        ];

        foreach ($planes as [$tipo, $precio, $dias]) {
            Membresia::updateOrCreate(
                ['tipo' => $tipo],
                ['precio' => $precio, 'duracion_dias' => $dias]
            );
        }

        // La contraseña se cifra automáticamente (cast 'hashed' del modelo User).
        $clave = env('SEED_ADMIN_PASSWORD', 'Cambiar.123');

        User::updateOrCreate(['email' => 'yerson@control.com'], [
            'name' => 'Yerson Valera', 'password' => $clave, 'rol' => 'admin',
        ]);
        User::updateOrCreate(['email' => 'recepcion@control.com'], [
            'name' => 'Recepción', 'password' => $clave, 'rol' => 'recepcionista',
        ]);
    }
}
