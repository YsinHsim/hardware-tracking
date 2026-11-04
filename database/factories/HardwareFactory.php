<?php

namespace Database\Factories;

use App\Models\AssignedUser;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\UpdateRecord;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hardware>
 */
class HardwareFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $sequence = 0;
        $sequence++;

        return [
            'hardware_no' => sprintf('HW-%04d', $sequence),
            'hardware_serial_no' => 'SN-' . strtoupper(fake()->bothify('??######')),
            'assigned_user_id' => fn () => AssignedUser::inRandomOrder()->first()?->id ?? AssignedUser::factory()->create()->id,
            'hardware_type_id' => fn () => HardwareType::inRandomOrder()->first()->id,
            'hardware_status_id' => fn () => HardwareStatus::inRandomOrder()->first()->id,
        ];
    }

    /**
     * Create 1-3 update records for the hardware after it is created.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Hardware $hardware) {
            $recordCount = random_int(1, 3);

            foreach (range(1, $recordCount) as $index) {
                UpdateRecord::create([
                    'record_name' => $index === 1 ? 'Hardware Created' : 'Hardware Updated',
                    'record_desc' => 'Seeded history entry.',
                    'record_last_updated' => Carbon::now()->subDays(random_int(1, 180)),
                    'hardware_id' => $hardware->id,
                    'user_id' => null,
                ]);
            }
        });
    }

    /**
     * Soft-delete the hardware after creation.
     */
    public function softDeleted(): static
    {
        return $this->afterCreating(function (Hardware $hardware) {
            $hardware->delete();
        });
    }
}
