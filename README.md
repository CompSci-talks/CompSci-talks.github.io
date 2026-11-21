# CompsciTalks

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### Public pages and search indexing

`npm run deploy` builds Angular and generates static HTML for the homepage,
schedule, archive, and public seminars before publishing to GitHub Pages. It
reads public seminar data anonymously from Firestore. A failed data fetch
stops deployment so the published archive isn't replaced with incomplete data.

Run `npm run deploy -- --dry-run` to generate and inspect the files locally.
Redeploy after a seminar is published, edited, or hidden to refresh the static
HTML and sitemap. Published HTML can remain in Git history and caches, so
publish only information intended for public access.

After publishing, verify the site in Google Search Console, submit
`https://compsci-talks.github.io/sitemap.xml`, and inspect and request indexing
for the homepage.
