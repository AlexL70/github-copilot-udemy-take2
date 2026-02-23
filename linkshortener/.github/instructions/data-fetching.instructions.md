---
description: Read this file to understand how to fetch data in this project.
applyTo: **/*.ts, **/*.tsx
---

# Data Fetching Guidelines

This document outlines the best practices for fetching data in our project. Follow these guidelines to ensure consistency and maintainability across the codebase.

## 1. Use Server Components for Data Fetching

Whenever possible, fetch data in server components. NEVER user client components to fetch data.

## 2. Data-Fetching Methods

ALWAYS use the helper functions in the /data directory to fetch data. NEVER fetch data directly in your components.
All helper functions in the /data directory must use Drizzle ORM to fetch data from the database. NEVER use raw SQL queries or other methods to fetch data.
