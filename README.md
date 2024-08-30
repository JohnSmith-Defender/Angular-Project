<p align="center">
  <img src="https://api.iconify.design/logos:angular-icon.svg" alt="Angular brand" width="100" height="100"/>
</p>

<h1 align="center">VCP</h1>

<br>

<p align='center'>
  <strong>English</strong> |
  <a href="https://github.com/juanmesa2097/angular-boilerplate/blob/main/README.es-CO.md">Español</a>
</p>

<br>

VCP (Vistingo Company Product) is a SaaS (Software as a Service) platform, where different communities can be built and monetized. A dedicated space is provided for each customer where they can share content, create events for their community members and invite guests, and monitor their user activities. Features are also made configurable to allow for customizations based on the communities’ specific needs. Credits to https://github.com/juanmesa2097/angular-boilerplate for the Angular boilerplate.

## ⚗️ Features

- [Angular 16](https://angular.io/docs)
- [PNPM](https://pnpm.io/), [esbuild](https://esbuild.github.io/)
- [Components independientes](https://angular.io/guide/standalone-components)
- [Señales](https://angular.io/guide/signals)
- [Carga diferida](https://angular.io/guide/lazy-loading-ngmodules)
- [PWA](https://angular.io/guide/service-worker-getting-started)
- [I18n](https://github.com/ngx-translate/core)
- [TailwindCSS](https://tailwindcss.com/)
- OS/Light/Dark themes

## ⚙ Prerequisites

- Node.js ([^16.14.0 || ^18.10.0](https://angular.io/guide/versions)): <https://nodejs.org/en/>
- PNPM: <https://pnpm.io/es/> If you're having compatibility issues, try with these specific versions: node v18.10.0 and pnpm v8.15.3
- Docker (optional): <https://www.docker.com/>

## 🏹 Start development

### Cloning the repository locally

```sh
git clone  https://github.com/vistingogrupo/vcp-web.git
```

### Install dependencies

```sh
pnpm install # run `pnpm install -g pnpm` if you don't have pnpm installed
```

### NOTE: 
Check compatibility on https://pnpm.io/installation#compatibility

```sh
Tested Working Combination:
node v18.10.0
pnpm v8.15.3
```

### Run project

```sh
pnpm dev
```

---

## 📝 Checklist

Please review this checklist and modify it as necessary to run the project.

- [ ] Install dependencies.
- [ ] Run the vcp-web-project.
- [ ] Run the vcp-api-latest project.

## 🐳 Docker

Create an image of the project.

```sh
docker buildx build -t vcp-web:latest .
```

Run the image of the project.

```sh
docker run --rm -p 8080:80 -d vcp-web:latest
```

## 🧙‍♂️ Commands

| Command         | Description                                              | npm                     | yarn                 | pnpm                 |
| --------------- | -------------------------------------------------------- | ----------------------- | -------------------- | -------------------- |
| `dev`           | Starts the development server                            | `npm run dev`           | `yarn dev`           | `pnpm dev`           |
| `dev:host`      | Starts the development server with a custom host         | `npm run dev`           | `yarn dev`           | `pnpm dev`           |
| `build`         | Builds the production code                               | `npm run build`         | `yarn build`         | `pnpm build`         |
| `watch`         | Builds the production code and watches for changes       | `npm run watch`         | `yarn watch`         | `pnpm watch`         |
| `test`          | Runs the unit tests                                      | `npm run test`          | `yarn test`          | `pnpm test`          |
| `test:headless` | Runs the unit tests in headless mode                     | `npm run test:headless` | `yarn test:headless` | `pnpm test:headless` |
| `lint`          | Runs the linter                                          | `npm run lint`          | `yarn lint`          | `pnpm lint`          |
| `lint:fix`      | Runs the linter and fixes any linting errors             | `npm run lint:fix`      | `yarn lint:fix`      | `pnpm lint:fix`      |
| `lint:staged`   | Runs the linter on staged files                          | `npm run lint:staged`   | `yarn lint:staged`   | `pnpm lint:staged`   |
| `stylelint`     | Runs the style linter                                    | `npm run stylelint`     | `yarn stylelint`     | `pnpm stylelint`     |
| `stylelint:fix` | Runs the style linter and fixes any style linting errors | `npm run stylelint:fix` | `yarn stylelint:fix` | `pnpm stylelint:fix` |
| `format`        | Formats the code with prettier                           | `npm run format`        | `yarn format`        | `pnpm format`        |
