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
        Schema::create('data_tag', static function (Blueprint $table) {
            $table->foreignId('data_id')->constrained(
                table: 'data'
            )->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained(
                table: 'tags'
            )->cascadeOnDelete();
            $table->primary(['data_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_tag');
    }
};
