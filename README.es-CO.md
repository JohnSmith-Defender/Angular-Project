<p align="center">
  <img src="https://api.iconify.design/logos:angular-icon.svg" alt="Angular brand" width="100" height="100"/>
</p>

<h1 align="center">VCP</h1>

<br>

<p align='center'>
  <a href="https://github.com/juanmesa2097/angular-boilerplate/blob/main/README.md">English</a> |
  <strong>Español</strong> 
</p>

<br>

VCP (Vistingo Company Product) es una plataforma SaaS (Software as a Service), donde se pueden construir y monetizar diferentes comunidades. Se proporciona un espacio dedicado para cada cliente donde pueden compartir contenido, crear eventos para los miembros de su comunidad e invitar a invitados, y monitorear sus actividades de usuario. Las características también se hacen configurables para permitir personalizaciones basadas en las necesidades específicas de las comunidades. Créditos a https://github.com/juanmesa2097/angular-boilerplate por el modelo Angular.

## ⚗️ Features

- [Angular 16](https://angular.io/docs)
- [PNPM](https://pnpm.io/), [esbuild](https://esbuild.github.io/)
- [Components independientes](https://angular.io/guide/standalone-components)
- [Señales](https://angular.io/guide/signals)
- [Carga diferida](https://angular.io/guide/lazy-loading-ngmodules)
- [PWA](https://angular.io/guide/service-worker-getting-started)
- [I18n](https://github.com/ngx-translate/core)
- [TailwindCSS](https://tailwindcss.com/)
- Temas OS/Light/Dark

## ⚙ Requisitos previos

- Node.js ([^16.14.0 || ^18.10.0](https://angular.io/guide/versions)): <https://nodejs.org/en/>
- PNPM: <https://pnpm.io/es/>
- Docker (opcional): <https://www.docker.com/>

## 🏹 Iniciar desarrollo

### Clonando el repositorio localmente

```sh
git clone  https://github.com/vistingogrupo/vcp-web.git
```

### Instalar dependencias

```sh
pnpm install # run `pnpm install -g pnpm` if you don't have pnpm installed
```

### Ejecutar proyecto

```sh
pnpm dev
```

---

## 📝 Checklist

Revise esta lista de verificación y modifíquela según sea necesario para ejecutar el proyecto.

- [ ] Instalar dependencias.
- [ ] Ejecute el proyecto vcp-web.
- [ ] Ejecute el proyecto vcp-web-api.

## 🐳 Docker

Crear una imagen del proyecto.

```sh
docker buildx build -t vcp-web:latest .
```

Ejecutar la imagen del proyecto.

```sh
docker run --rm -p 8080:80 -d vcp-web:latest
```

## 🧙‍♂️ Comandos

| Comando         | Descripción                                                               | npm                     | yarn                 | pnpm                 |
| --------------- | ------------------------------------------------------------------------- | ----------------------- | -------------------- | -------------------- |
| `dev`           | Inicia el servidor de desarrollo                                          | `npm start`             | `yarn start`         | `pnpm start`         |
| `dev:host`      | Inicia el servidor de desarrollo con un host personalizado                | `npm start`             | `yarn start`         | `pnpm start`         |
| `build`         | Compila el código de producción                                           | `npm run build`         | `yarn build`         | `pnpm build`         |
| `watch`         | Compila el código de producción y lo vigila para detectar cambios         | `npm run watch`         | `yarn watch`         | `pnpm watch`         |
| `test`          | Ejecuta las pruebas unitarias                                             | `npm run test`          | `yarn test`          | `pnpm test`          |
| `test:headless` | Ejecuta las pruebas unitarias en modo sin cabeza                          | `npm run test:headless` | `yarn test:headless` | `pnpm test:headless` |
| `lint`          | Ejecuta el linter                                                         | `npm run lint`          | `yarn lint`          | `pnpm lint`          |
| `lint:fix`      | Ejecuta el linter y corrige cualquier error de lint                       | `npm run lint:fix`      | `yarn lint:fix`      | `pnpm lint:fix`      |
| `lint:staged`   | Ejecuta el linter en los archivos en cola                                 | `npm run lint:staged`   | `yarn lint:staged`   | `pnpm lint:staged`   |
| `stylelint`     | Ejecuta el linter de estilos                                              | `npm run stylelint`     | `yarn stylelint`     | `pnpm stylelint`     |
| `stylelint:fix` | Ejecuta el linter de estilos y corrige cualquier error de lint de estilos | `npm run stylelint:fix` | `yarn stylelint:fix` | `pnpm stylelint:fix` |
| `format`        | Formatea el código con Prettier                                           | `npm run format`        | `yarn format`        | `pnpm format`        |
