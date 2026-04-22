"""Supabase client helpers for Sports Hub."""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


def _get_required_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise ValueError(f"Missing required environment variable: {var_name}")
    return value


def get_supabase_client() -> Client:
    """Get Supabase client with anon key (for auth operations)."""
    supabase_url = _get_required_env("SUPABASE_URL")
    supabase_anon_key = _get_required_env("SUPABASE_ANON_KEY")
    return create_client(supabase_url, supabase_anon_key)


def get_supabase_admin() -> Client:
    """Get Supabase admin client (bypasses RLS)."""
    supabase_url = _get_required_env("SUPABASE_URL")
    supabase_service_key = _get_required_env("SUPABASE_SERVICE_KEY")
    return create_client(supabase_url, supabase_service_key)
