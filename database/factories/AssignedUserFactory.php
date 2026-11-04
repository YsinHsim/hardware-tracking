<?php

namespace Database\Factories;

use App\Models\AssignedUser;
use App\Models\Estate;
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
            'estate_id' => Estate::inRandomOrder()->first()->id,
        ];
    }
}
