<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('socios', function (Blueprint $table) {
        $table->id();
        $table->foreignId('membresia_id')->constrained('membresias');
        $table->string('nombre', 100);
        $table->string('cedula', 20)->unique();
        $table->string('telefono', 20);
        $table->string('email')->nullable();
        $table->date('fecha_inicio');
        $table->date('fecha_vencimiento');
        $table->enum('estado', ['activo', 'inactivo'])->default('activo');
        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('socios');
    }
};
