# Personal website

Source for a personal website, built with [Quarto](https://quarto.org) and published with GitHub
Pages. Every upload to the `main` branch rebuilds the site.

See `TEMPLATE.md` for what each file does and where to start.

## What's where

| Path | What it is |
|---|---|
| `_quarto.yml` | Site name, menu, footer and theme. |
| `index.qmd` | Home page. |
| `_selected-papers.qmd`, `papers.js` | The selected publications shown on the home page. |
| `about.qmd` | The About me page: biography and professional activities. It pulls in the three files below. |
| `_research.qmd`, `_publications.qmd`, `_talks.qmd` | The Research, Publications and Talks sections of the About me page. Edit these to change those sections. |
| `projects/` | One page per grant, opened from the home page. |
| `images/` | Photo and background pictures. |
| `theme.scss`, `styles.css` | Colours and layout. |
| `_site/` | The built site. Never edit by hand; it is rebuilt from the files above. |

## Working on the site

### Writing

Pages are plain text files with a small header between `---` marks. Markdown covers headings,
**bold**, *italics*, links, lists, tables, quotations, code and mathematics.

### A new paper or talk

Add a line to `_publications.qmd` or a row to `_talks.qmd`; both appear on the About me page. To show
a paper on the home page as well, copy one block in `_selected-papers.qmd` and change its text.

### Checking before publishing

With Quarto installed, `quarto preview` opens the site in a browser and updates as files are saved,
and `quarto render` builds it into `_site/`.

Without Quarto, upload the change and let GitHub build it: open the **Actions** tab, wait for the run
to finish, and download **site-preview** from the bottom of the run's page. Unzip it and open
`index.html`.

## Publishing

One-time setup in the repository on GitHub: **Settings → Pages → Build and deployment → Source**,
set to **GitHub Actions**. After that, every upload to `main` rebuilds and publishes the site. The
address appears under Settings → Pages; put it into `_quarto.yml` as `site-url`.

GitHub Pages publishes from a public repository on a free plan. To keep the source private and
publish only the built pages, this can be changed to push the finished site to a separate public
repository instead.

## Uploading from a browser

If you work through the GitHub website rather than git: **Add file → Upload files**, then drag in
the files or folders, keeping their folder names, and commit. Uploading a folder adds and replaces
files inside it and leaves the rest alone. Deleting a file needs the file's own page, or its
folder's **⋯** menu.
