<?php

namespace Database\Seeders;

use App\Models\Estate;
use App\Models\Region;
use Illuminate\Database\Seeder;

class EstateSeeder extends Seeder
{
    /**
     * One representative estate per region so the app has a real
     * structure to hang users and hardware on. firstOrCreate keeps
     * re-runs idempotent.
     */
    public function run(): void
    {
        $estates = [
            ['estate_name' => 'KK HQ Office', 'region_name' => 'Kota Kinabalu'],
            ['estate_name' => 'Penampang Branch', 'region_name' => 'Penampang'],
            ['estate_name' => 'Putatan Site', 'region_name' => 'Putatan'],
            ['estate_name' => 'Papar Depot', 'region_name' => 'Papar'],
            ['estate_name' => 'Kota Belud Station', 'region_name' => 'Kota Belud'],
            ['estate_name' => 'Kudat Station', 'region_name' => 'Kudat'],
            ['estate_name' => 'Ranau Site Office', 'region_name' => 'Ranau'],
            ['estate_name' => 'Sandakan Branch', 'region_name' => 'Sandakan'],
            ['estate_name' => 'Lahad Datu Depot', 'region_name' => 'Lahad Datu'],
            ['estate_name' => 'Tawau Branch', 'region_name' => 'Tawau'],
            ['estate_name' => 'Semporna Site', 'region_name' => 'Semporna'],
            ['estate_name' => 'Keningau Office', 'region_name' => 'Keningau'],
            ['estate_name' => 'Tenom Station', 'region_name' => 'Tenom'],
            ['estate_name' => 'Beaufort Depot', 'region_name' => 'Beaufort'],
            ['estate_name' => 'Sipitang Office', 'region_name' => 'Sipitang'],
        ];

        foreach ($estates as $estate) {
            $region = Region::where('region_name', $estate['region_name'])->first();

            if ($region === null) {
                continue;
            }

            Estate::firstOrCreate(
                ['estate_name' => $estate['estate_name']],
                ['region_id' => $region->id]
            );
        }
    }
}
