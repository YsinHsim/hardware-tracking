<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Region;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * One representative branch per region so the app has a real
     * structure to hang users and hardware on. firstOrCreate keeps
     * re-runs idempotent.
     */
    public function run(): void
    {
        $branches = [
            ['branch_name' => 'KK HQ Office', 'region_name' => 'Kota Kinabalu'],
            ['branch_name' => 'Penampang Branch', 'region_name' => 'Penampang'],
            ['branch_name' => 'Putatan Site', 'region_name' => 'Putatan'],
            ['branch_name' => 'Papar Depot', 'region_name' => 'Papar'],
            ['branch_name' => 'Kota Belud Station', 'region_name' => 'Kota Belud'],
            ['branch_name' => 'Kudat Station', 'region_name' => 'Kudat'],
            ['branch_name' => 'Ranau Site Office', 'region_name' => 'Ranau'],
            ['branch_name' => 'Sandakan Branch', 'region_name' => 'Sandakan'],
            ['branch_name' => 'Lahad Datu Depot', 'region_name' => 'Lahad Datu'],
            ['branch_name' => 'Tawau Branch', 'region_name' => 'Tawau'],
            ['branch_name' => 'Semporna Site', 'region_name' => 'Semporna'],
            ['branch_name' => 'Keningau Office', 'region_name' => 'Keningau'],
            ['branch_name' => 'Tenom Station', 'region_name' => 'Tenom'],
            ['branch_name' => 'Beaufort Depot', 'region_name' => 'Beaufort'],
            ['branch_name' => 'Sipitang Office', 'region_name' => 'Sipitang'],
        ];

        foreach ($branches as $branch) {
            $region = Region::where('region_name', $branch['region_name'])->first();

            if ($region === null) {
                continue;
            }

            Branch::firstOrCreate(
                ['branch_name' => $branch['branch_name']],
                ['region_id' => $region->id]
            );
        }
    }
}
