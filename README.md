# PDFy 📄✨

**Tired of IDEs exporting your code as massive, unsearchable image-based PDFs? PDFy is here to help!**

PDFy is a client-side web application built with SvelteKit and ShadcnSvelte that allows you to select a local project
folder, choose specific code and text files, preview them with syntax highlighting, and then print them to a clean,
text-based, searchable PDF using your browser's built-in print functionality.

**Live Demo:** [https://pdfy.oseifert.ch](https://pdfy.oseifert.ch)

## ⚠️ Important Note & Current Limitations

Please keep in mind that this project was put together quickly (in about a day!). As such, users **shouldn't expect
complete stability or full feature compatibility** at this stage.

*   **Not all advertised features are fully implemented.**
*   **HTML, Markdown (.md), and XML rendering has not been thoroughly tested and may not work correctly.**
*   Currently, PDFy primarily focuses on rendering **raw text files with syntax highlighting.**

Development is ongoing, and contributions are welcome to improve functionality and address these limitations!

## The Problem PDFy Solves

Many developers, especially students preparing project documentation, face issues with IDEs or tools that generate PDFs
by rasterizing code into images or that can't even do it. This results in:

*   HUGE file sizes (e.g., 100MB instead of <5MB).
*   Non-searchable content.
*   Poor text quality and inability to select/copy code.

PDFy aims to provide a simple, local, and effective solution to generate high-quality, text-based PDFs of your codebase
and documentation.

## Key Features ✨

*   **Local Processing:** No server-side uploads! All file processing happens directly in your browser using the File
    System Access API. Your code stays on your machine.
*   **Folder Select:** Select an entire project folder from your local file system.
*   **File Tree Navigation:** View your project's folder structure and select specific files.
*   **Live Preview:** See an instant preview of your selected files with syntax highlighting.
*   **Syntax Highlighting:** Powered by `highlight.js` for a wide range of programming languages.
*   **Markdown Support:** Preview rendered Markdown files (experimental, see note above).
*   **Print to PDF:** Uses your browser's native "Print to PDF" functionality with optimized print CSS for clean output.
*   **Text-Based & Searchable PDFs:** Generates PDFs where text is text, not an image.
*   **Customizable:** Settings for themes, line numbers, etc. (partially implemented).
*   **GitIgnore Support:** Automatically ignores files and directories specified in `.gitignore` files within the selected
    project directory.

## Tech Stack 🛠️

*   **Framework:** [SvelteKit](https://kit.svelte.dev/)
*   **UI Components:** [ShadcnSvelte](https://www.shadcn-svelte.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Package Manager & Runtime:** [Bun](https://bun.sh/)
*   **Syntax Highlighting:** [highlight.js](https://highlightjs.org/)

## Getting Started 🚀

To run PDFy locally, you'll need [Bun](https://bun.sh/) installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ImGajeed76/pdfy.git
    cd pdfy
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Run the development server:**
    ```bash
    bun run dev
    ```
    This will start the development server, typically on `http://localhost:5173`.

## How It Works ⚙️

1.  You select a local project directory using the browser's File System Access API.
2.  PDFy reads the directory structure and displays it.
3.  You select files you want to include in your PDF.
4.  Selected files are previewed with appropriate syntax highlighting or rendering.
5.  When you're ready, you click "Print to PDF".
6.  PDFy uses CSS media queries (`@media print`) to style the content specifically for printing, hiding the application
    UI and formatting the code/text for a standard page.
7.  Your browser's print dialog opens, allowing you to save the output as a PDF.

## Supported File Types 📚

PDFy aims to support a wide variety of text-based files, including but not limited to:

*   **Programming Languages:** JavaScript, TypeScript, Python, Java, C, C++, C#, Rust, Go, PHP, Ruby, Swift,
    Kotlin, Scala, and many more supported by `highlight.js`.
*   **Markup & Data:** HTML, CSS, JSON, XML, YAML, TOML, Markdown (.md - rendering is experimental, see note above).
*   **Configuration & Scripts:** `.sh`, `.bash`, `.ps1`, `Dockerfile`, `.env`, `.conf`, `.ini`, `.sql`.
*   **Plain Text:** `.txt`, `.log`, `.gitignore`, and other generic text files.

If a file is text-based, PDFy will do its best to display it with syntax highlighting. Unknown code file types will be treated as plain text.
For HTML, MD, and XML, rendering is currently experimental and may default to raw text.

## Contributing 🤝

Contributions are welcome! If you have ideas for improvements, new features, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code follows the existing style and that any new dependencies are justified.

## License 📜

This project is licensed under the **GNU General Public License v3.0**.
See the [LICENSE](LICENSE) file for more details.

---

Made with ❤️ to solve a frustrating problem. Hope it helps you too!
