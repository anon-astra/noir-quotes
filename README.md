# Noir

Minimal AMOLED-black quote reader built in Svelte 5 and Vite. Responsive, keyboard accessible, with exact numbered lookup, random fetch, search, bookmarks, copy, and local text/JSON import. No analytics, accounts, external fonts, or backend.

## Content status

Includes two short attributed sample excerpts (19 words total) from the first supplied thread. It does not contain the full 400-quote collection. The second thread was not accessible during preparation. No quotes were fabricated to fill the collection.

Supply text you have permission to publish in `public/quotes.json` to change the public collection. Importing through the interface only changes the current browser, not the deployed site. Quote text is rendered as text, not HTML. Only HTTP(S) source links are accepted.

JSON format:

```json
[
  { "id": 1, "text": "Your quote here", "author": "Author", "source": "https://example.com/source" }
]
```

The interface also accepts UTF-8 `.txt` files with one quote per nonempty line. Numbered prefixes such as `14-`, `266.`, and `400 —` are parsed as original quote IDs. Text import defaults the author to Rivelino; use JSON for other authors. Import replaces the current device's collection. Up to 10,000 quotes / 5 MB supported. Bookmarks and imported quotes are stored on the device using localStorage. Browser storage clearing removes them.

Source references:
- https://threadreaderapp.com/thread/1638490799305289728.html
- https://threadreaderapp.com/thread/1680336720439508994.html

## Run locally

Use Node 22.12 or newer.

```sh
npm install
npm run dev
```

```sh
npm run build
npm run preview
```

## Publish to GitHub Pages

1. Create a GitHub repository and push this directory's contents to `main`. Include `.github/workflows/deploy.yml`.
2. In repository Settings → Pages, select **GitHub Actions** as the source.
3. Run **Publish to GitHub Pages** in Actions (or push to `main`).
4. Open the URL shown by the successful deployment.

The relative Vite base supports both repository project pages and root pages. No SPA routes or secrets are needed. The workflow currently uses `npm install` because dependency installation was blocked in the authoring environment and no lockfile could be generated. Once dependencies are installed, commit the resulting package-lock.json and switch the workflow to `npm ci` for reproducible installations.

Official deployment reference: https://vite.dev/guide/static-deploy.html#github-pages

## Validation status

Source, JSON, and workflow were inspected. Focused Node assertions passed for exact ID lookup, missing and invalid IDs, preserving numbered imports, non-repeating random selection, and empty collections. Dependency downloads returned HTTP 403 in the authoring environment. Production compilation and visual/browser tests have therefore NOT been completed. No repository has been created and no live deployment has occurred. GitHub account access is needed to publish.

## Fetch controls

Enter an original quote number and press Fetch quote (or Enter). Lookup searches the entire loaded collection and clears active search and Saved filters on success. Missing IDs produce an explicit message without changing the displayed quote. Random quote also uses the entire loaded collection and avoids the current entry when more than one quote is loaded. Both controls operate on loaded data; neither scrapes the source threads.
