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
        Schema::create('analyses', static function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->json('parameters')->default('{}');
            $table->json('results')->default('{}');
            $table->string('queue_id')->nullable();
            $table->enum('status', JobStatus::toValuesArray())->default(JobStatus::PENDING->value);
            $table->text('reasons')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analyses');
    }
};
