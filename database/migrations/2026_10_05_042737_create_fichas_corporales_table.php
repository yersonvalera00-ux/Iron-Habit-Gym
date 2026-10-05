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
        Schema::create('fichas_corporales', function (Blueprint $table) {
        $table->id();
        $table->foreignId('socio_id')->constrained('socios')->cascadeOnDelete();
        $table->decimal('peso', 5, 2);
        $table->decimal('estatura', 3, 2);
        $table->decimal('imc', 4, 2);
        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fichas_corporales');
    }
};
