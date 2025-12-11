# Workflow: Making Tailwind the Main Branch

Since `tailwind` is becoming the new standard for this project, here is the recommended workflow to make it the `main` branch while safely preserving the history of your legacy CSS version.

## 1. Snapshot the Legacy Version
First, go to your current `main` branch (which still uses the old styling) and create a permanent archive branch. This ensures you can always go back to the pre-Tailwind state if needed.

```bash
git checkout main
git checkout -b legacy-css-version
git push -u origin legacy-css-version
```

## 2. Update Main
Now, update `main` with the changes from the `tailwind` branch. This preserves the git history showing the evolution of the project.

```bash
git checkout main
git merge tailwind
git push origin main
```

## 3. Cleanup (Optional)
Once `main` is updated and you have confirmed everything is working correctly, you can delete the `tailwind` branch if you wish, or keep it for reference.

```bash
# Optional: Delete local tailwind branch
git branch -d tailwind

# Optional: Delete remote tailwind branch
git push origin --delete tailwind
```

## 4. Update GitHub Pages
Finally, if you haven't already:
1.  Go to your GitHub Repository **Settings**.
2.  Navigate to **Pages**.
3.  Ensure the source branch is set to `main` (since `main` now contains the Tailwind version).
