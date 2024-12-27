<?php

use App\Enums\JobStatus;
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
        Schema::create('data', static function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('data_type_id')->constrained()->restrictOnDelete();
            $table->boolean('is_public')->default(false);
            $table->string('queue_id')->nullable();
            $table->enum('status', JobStatus::toValuesArray())->default(JobStatus::PENDING->value);
            $table->foreignId('dataset_id')->constrained()->restrictOnDelete();
            $table->json('content')->default('{}');
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data');
    }
};
