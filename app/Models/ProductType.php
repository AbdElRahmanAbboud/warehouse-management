<?php

namespace App\Models;

use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ProductType extends Model implements HasMedia
{
    use CascadeSoftDeletes, HasFactory, InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        'name',
    ];

    protected $cascadeDeletes = ['items'];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function availableitems(): HasMany
    {
        return $this->items()->where('is_sold', false);
    }

    public function myAvailableItems(): HasMany
    {
        return $this->items()
            ->where('is_sold', false)
            ->where('added_by', auth()->id());
    }

    public function myItems(): HasMany
    {
        return $this->items()->where('added_by', auth()->id());
    }
}
