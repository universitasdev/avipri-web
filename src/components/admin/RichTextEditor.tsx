"use client";

import { useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/admin/ui/alert-dialog";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { looksLikeHtml, plainTextToHtml } from "@/lib/observatorio/plain-text";
import { cn } from "@/lib/utils";

function ToolbarButton({
  label,
  icon,
  pressed,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={pressed}
      disabled={disabled}
      // Sin quitar el foco del texto: así la negrita o la lista se aplican a lo seleccionado.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="h-10 px-3 text-sm aria-pressed:border-brand-navy aria-pressed:bg-brand-navy aria-pressed:text-white"
    >
      {icon}
      {label}
    </Button>
  );
}

function currentState(editor: Editor | null) {
  return {
    bold: editor?.isActive("bold") ?? false,
    italic: editor?.isActive("italic") ?? false,
    heading: editor?.isActive("heading", { level: 2 }) ?? false,
    bulletList: editor?.isActive("bulletList") ?? false,
    orderedList: editor?.isActive("orderedList") ?? false,
    link: editor?.isActive("link") ?? false,
    canUndo: editor?.can().undo() ?? false,
    canRedo: editor?.can().redo() ?? false,
  };
}

/**
 * Editor del cuerpo de la noticia con botones grandes y con texto (negrita, subtítulo, listas,
 * enlaces). Guarda el HTML en un campo oculto con `name`, así el formulario lo envía igual que
 * antes. Al pegar desde Word se conserva solo el formato permitido.
 */
export function RichTextEditor({
  id,
  name,
  defaultValue,
  onChange,
  describedBy,
}: {
  id: string;
  name: string;
  defaultValue: string;
  onChange?: () => void;
  describedBy?: string;
}) {
  const initial = (
    looksLikeHtml(defaultValue) ? defaultValue : plainTextToHtml(defaultValue)
  ).replace(/(<p><\/p>)+$/, "");
  const [html, setHtml] = useState(initial);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
    ],
    content: initial,
    // Evita diferencias entre servidor y navegador: el editor se crea ya en el navegador.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        class:
          "news-rich-text min-h-56 px-4 py-3 text-base leading-relaxed text-brand-text focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      // Sin los párrafos vacíos del final (el Enter de más), que solo dejan espacio en blanco.
      setHtml(current.isEmpty ? "" : current.getHTML().replace(/(<p><\/p>)+$/, ""));
      onChange?.();
    },
  });

  const state = useEditorState({ editor, selector: ({ editor: current }) => currentState(current) });
  const active = state ?? currentState(null);

  function openLinkDialog() {
    if (!editor) return;
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "https://");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!/^https:\/\/\S+\.\S+/.test(url)) {
      toast.error("Revisa la dirección del enlace", {
        description: "Copia y pega la dirección completa; debe empezar con https://",
      });
      return;
    }
    const { empty } = editor.state.selection;
    if (empty && !editor.isActive("link")) {
      // Sin texto seleccionado: se escribe la dirección misma como enlace.
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setLinkOpen(false);
  }

  return (
    <div className="rounded-md border border-brand-border bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand-navy/25">
      <div
        role="toolbar"
        aria-label="Formato del texto"
        className="flex flex-wrap gap-2 border-b border-brand-border bg-slate-50 p-2"
      >
        <ToolbarButton
          label="Negrita"
          icon={<Bold aria-hidden="true" />}
          pressed={active.bold}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Cursiva"
          icon={<Italic aria-hidden="true" />}
          pressed={active.italic}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Subtítulo"
          icon={<Heading2 aria-hidden="true" />}
          pressed={active.heading}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Lista"
          icon={<List aria-hidden="true" />}
          pressed={active.bulletList}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Lista numerada"
          icon={<ListOrdered aria-hidden="true" />}
          pressed={active.orderedList}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Enlace"
          icon={<Link2 aria-hidden="true" />}
          pressed={active.link}
          disabled={!editor}
          onClick={openLinkDialog}
        />
        {active.link ? (
          <ToolbarButton
            label="Quitar enlace"
            icon={<Unlink aria-hidden="true" />}
            onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
          />
        ) : null}
        <ToolbarButton
          label="Deshacer"
          icon={<Undo2 aria-hidden="true" />}
          disabled={!active.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Rehacer"
          icon={<Redo2 aria-hidden="true" />}
          disabled={!active.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>

      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        // Mientras carga el editor se muestra el texto, para que no salte la página.
        <div
          className={cn("news-rich-text min-h-56 px-4 py-3 text-base leading-relaxed text-brand-muted")}
          dangerouslySetInnerHTML={{ __html: initial }}
        />
      )}
      <input type="hidden" name={name} value={html} />

      <AlertDialog open={linkOpen} onOpenChange={setLinkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poner un enlace</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Copia la dirección de la página (empieza con https://) y pégala aquí. Si seleccionaste
              un texto, ese texto será el enlace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`${id}-link`} className="text-base">
              Dirección del enlace
            </Label>
            <Input
              id={`${id}-link`}
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
              className="h-12 text-base"
              placeholder="https://"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button type="button" onClick={applyLink}>
              Poner enlace
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
