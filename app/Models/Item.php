<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'product_type_id',
        'added_by',
        'serial_number',
        'is_sold',
        'sold_at',
    ];

    protected $casts = [
        'is_sold' => 'boolean',
        'sold_at' => 'datetime',
    ];

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function scopeMine(Builder $query): Builder
    {
       return $query->where('added_by', auth()->id());
    }

    public function scopeSold(Builder $query): Builder
    {
        return $query->where('is_sold', true);
    }

    public function scopeNotSold(Builder $query): Builder
    {
        return $query->where('is_sold', false);
    }
}

