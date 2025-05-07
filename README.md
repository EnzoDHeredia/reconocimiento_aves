# Reconocimiento de Aves

Reconocimiento de aves mediante imágenes usando una interfaz web y un backend de predicción basado en deep learning.

## Características

- **Subida y recorte de imágenes** desde la web.
- **Predicción automática** de la especie de ave.
- **Visualización de información** relevante: nombre común, científico, orden, familia, confianza, género.
- **Interfaz responsiva** y amigable.
- **Fondo decorativo** con siluetas de aves.

---

## Tecnologías usadas

### Frontend

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-easy-crop](https://github.com/ValerySchneider/react-easy-crop)
- [react-dropzone](https://react-dropzone.js.org/)

### Backend

- [Flask](https://flask.palletsprojects.com/)
- [PyTorch](https://pytorch.org/) (modelo EfficientNet)
- [Pillow](https://python-pillow.org/) para procesamiento de imágenes
- [eBird Taxonomy](https://www.birds.cornell.edu/home/ebird-taxonomy/) para información adicional

---

## Uso

1. Sube o arrastra una imagen de un ave en la web.
2. Ajusta el recorte si es necesario.
3. Espera la predicción automática.
4. Visualiza la información de la especie identificada.

---

## Demo del Proyecto:

[![Demo del Proyecto](https://img.youtube.com/vi/1ubZwLGUeyg/0.jpg)](https://www.youtube.com/watch?v=1ubZwLGUeyg)
