"""
Aggregated models module for the `entities` app.

Django expects a `models` module inside each app package so it can import
models at the correct time during app loading. Keep this file minimal and
import-only — avoid importing non-model modules here.
"""

from .entities.users import *
from .entities.blog import *
from .entities.coupons import *
from .entities.message import *
from .entities.recycling import *

__all__ = [
    # users
    'User', 'Wallet', 'WalletHistory', 'RecyclingPoint',
    # blog
    'PostBlog', 'PostImage',
    # coupons
    'PartnerCompany', 'Coupon', 'CouponTransaction',
    # message
    'Message',
    # recycling
    'RecyclingValue', 'Recycling'
]
