# Dockrells Healthy Eating — Version 2

Version 2 upgrades:
- 81 food-photo recipe cards and recipe headers
- visual recipe picker in Meal Planner
- automatic ingredient scaling when servings change
- consolidated shopping list for compatible ingredient quantities
- full-screen cooking mode with previous/next steps
- improved offline cache
- app icons stored in the correct `/assets` folder
- retains search, filters, favourites, dark mode and random meal picker

## Update your existing GitHub site
1. Open your `Dockrells-Healthy-Eating` repository.
2. Upload the contents of this ZIP to the repository root.
3. Choose **Commit changes** to the `main` branch.
4. IMPORTANT: upload the `assets` folder as a folder, including:
   - assets/icon-192.png
   - assets/icon-512.png
   - assets/recipes/ (81 JPG images)
5. GitHub Pages should redeploy automatically.
6. Open your site and refresh. If the old app persists, fully close Safari and reopen it once; the V2 service worker clears the V1 cache.

Your existing GitHub Pages settings can remain on:
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)
