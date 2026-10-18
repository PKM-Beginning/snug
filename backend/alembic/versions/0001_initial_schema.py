"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-10-18 14:10:13.976297
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    
    op.create_table('merchants',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('slug', sa.String(length=40), nullable=False),
    sa.Column('website_url', sa.String(length=255), nullable=False),
    sa.Column('affiliate_network', sa.String(length=80), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
    sa.Column('sync_interval_minutes', sa.Integer(), nullable=True),
    sa.Column('offer_cache_ttl_seconds', sa.Integer(), nullable=True),
    sa.Column('max_offer_age_hours', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.CheckConstraint('max_offer_age_hours IS NULL OR max_offer_age_hours > 0', name='ck_merchants_max_offer_age'),
    sa.CheckConstraint('offer_cache_ttl_seconds IS NULL OR offer_cache_ttl_seconds >= 0', name='ck_merchants_cache_ttl'),
    sa.CheckConstraint('sync_interval_minutes IS NULL OR sync_interval_minutes > 0', name='ck_merchants_sync_interval'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('slug', name='uq_merchants_slug')
    )
    op.create_table('products',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=160), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('brand', sa.String(length=120), nullable=False),
    sa.Column('category', sa.String(length=32), nullable=False),
    sa.Column('gender', sa.String(length=16), nullable=False),
    sa.Column('image_url', sa.String(length=1024), nullable=True),
    sa.Column('winter_score', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Numeric(precision=2, scale=1), nullable=True),
    sa.Column('review_count', sa.Integer(), nullable=True),
    sa.Column('rating_source', sa.String(length=32), nullable=True),
    sa.Column('is_demo', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.CheckConstraint("category IN ('jackets', 'hoodies', 'sweaters', 'sweatshirts', 'accessories', 'footwear')", name='ck_products_category'),
    sa.CheckConstraint("gender IN ('men', 'women', 'kids', 'unisex')", name='ck_products_gender'),
    sa.CheckConstraint('rating IS NULL OR (rating >= 0 AND rating <= 5)', name='ck_products_rating'),
    sa.CheckConstraint('review_count IS NULL OR review_count >= 0', name='ck_products_review_count'),
    sa.CheckConstraint('winter_score BETWEEN 0 AND 100', name='ck_products_winter_score'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('slug', name='uq_products_slug')
    )
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.create_index('ix_products_brand', ['brand'], unique=False)
        batch_op.create_index('ix_products_category_gender', ['category', 'gender'], unique=False)
        batch_op.create_index('ix_products_created_at', ['created_at'], unique=False)

    op.create_table('offers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('merchant_id', sa.Integer(), nullable=False),
    sa.Column('external_product_id', sa.String(length=128), nullable=False),
    sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('mrp', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('currency', sa.String(length=3), server_default='INR', nullable=False),
    sa.Column('availability', sa.String(length=16), nullable=False),
    sa.Column('affiliate_url', sa.String(length=2048), nullable=True),
    sa.Column('last_checked_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('is_demo', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.CheckConstraint("availability IN ('in_stock', 'low_stock', 'out_of_stock')", name='ck_offers_availability'),
    sa.CheckConstraint('length(currency) = 3', name='ck_offers_currency_len'),
    sa.CheckConstraint('mrp IS NULL OR mrp >= price', name='ck_offers_mrp_gte_price'),
    sa.CheckConstraint('price >= 0', name='ck_offers_price_nonnegative'),
    sa.ForeignKeyConstraint(['merchant_id'], ['merchants.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('merchant_id', 'external_product_id', name='uq_offers_merchant_external_id')
    )
    with op.batch_alter_table('offers', schema=None) as batch_op:
        batch_op.create_index('ix_offers_last_checked_at', ['last_checked_at'], unique=False)
        batch_op.create_index('ix_offers_merchant_id', ['merchant_id'], unique=False)
        batch_op.create_index('ix_offers_product_price', ['product_id', 'price'], unique=False)

    op.create_table('product_images',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('image_url', sa.String(length=1024), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.CheckConstraint('position >= 0', name='ck_product_images_position'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('product_id', 'position', name='uq_product_images_position')
    )
    op.create_table('sync_jobs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('merchant_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(length=16), nullable=False),
    sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('products_processed', sa.Integer(), server_default='0', nullable=False),
    sa.Column('error_message', sa.Text(), nullable=True),
    sa.CheckConstraint("status IN ('pending', 'running', 'succeeded', 'failed')", name='ck_sync_jobs_status'),
    sa.CheckConstraint('products_processed >= 0', name='ck_sync_jobs_processed'),
    sa.ForeignKeyConstraint(['merchant_id'], ['merchants.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('sync_jobs', schema=None) as batch_op:
        batch_op.create_index('ix_sync_jobs_merchant_started', ['merchant_id', 'started_at'], unique=False)
        batch_op.create_index('ix_sync_jobs_status', ['status'], unique=False)

    


def downgrade() -> None:
    
    with op.batch_alter_table('sync_jobs', schema=None) as batch_op:
        batch_op.drop_index('ix_sync_jobs_status')
        batch_op.drop_index('ix_sync_jobs_merchant_started')

    op.drop_table('sync_jobs')
    op.drop_table('product_images')
    with op.batch_alter_table('offers', schema=None) as batch_op:
        batch_op.drop_index('ix_offers_product_price')
        batch_op.drop_index('ix_offers_merchant_id')
        batch_op.drop_index('ix_offers_last_checked_at')

    op.drop_table('offers')
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_index('ix_products_created_at')
        batch_op.drop_index('ix_products_category_gender')
        batch_op.drop_index('ix_products_brand')

    op.drop_table('products')
    op.drop_table('merchants')
    
