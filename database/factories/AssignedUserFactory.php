<?php

namespace Database\Factories;

use App\Models\AssignedUser;
use App\Models\Branch;
use App\Models\UserPosition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssignedUser>
 */
class AssignedUserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_name' => fake()->name(),
            'user_position_id' => UserPosition::inRandomOrder()->first()->id,
            'branch_id' => Branch::inRandomOrder()->first()->id,
        ];
    }
}
