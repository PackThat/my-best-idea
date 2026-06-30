#!/bin/bash
# This script generates a project_structure.txt file for the src directory.
> project_structure.txt
echo "src/" >> project_structure.txt
for item in src/*; do
    if [ -f "$item" ]; then
        echo "  $(basename "$item")" >> project_structure.txt
    fi
done
for item in src/*; do
    if [ -d "$item" ]; then
        echo "  $(basename "$item")/" >> project_structure.txt
        for subitem in "$item"/*; do
            echo "    $(basename "$subitem")" >> project_structure.txt
        done
    fi
done
echo "project_structure.txt has been updated."