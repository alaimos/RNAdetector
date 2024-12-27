<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // TODO: This should run only the first time the application is installed
        User::factory()->create([
            'name' => 'Default User',
            'email' => config('auth.default_user'),
            'is_admin' => true,
        ]);
    }
}
