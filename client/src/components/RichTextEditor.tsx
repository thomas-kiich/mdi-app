/**
 * RichTextEditor – wiederverwendbarer WYSIWYG-Editor auf Basis von TipTap.
 * Unterstützt: Fett, Kursiv, Unterstrichen, Farben, Überschriften, Listen, Ausrichtung.
 * Gibt HTML-String zurück (value/onChange).
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Farb-Palette für KIICH
const COLORS = [
  { label: "Weiß", value: "#ffffff" },
  { label: "Hellgrau", value: "#d1d5db" },
  { label: "Orange", value: "#f97316" },
  { label: "Gold", value: "#eab308" },
  { label: "Grün", value: "#22c55e" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Blau", value: "#3b82f6" },
  { label: "Lila", value: "#a855f7" },
  { label: "Rosa", value: "#ec4899" },
  { label: "Rot", value: "#ef4444" },
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Text eingeben...",
  className,
  minHeight = "200px",
}: RichTextEditorProps) {
  const isInternalChange = useRef(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-orange-400 underline cursor-pointer hover:text-orange-300",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[inherit] prose prose-invert max-w-none",
      },
    },
  });

  // Externen Wert synchronisieren (z.B. beim Laden gespeicherter Daten)
  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-xs font-medium transition-colors",
        active
          ? "bg-orange-500 text-white"
          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className={cn(
        "border border-white/20 rounded-lg overflow-hidden bg-black/30",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-black/40">
        {/* Textformatierung */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Fett"
        >
          <strong>F</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Kursiv"
        >
          <em>K</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Unterstrichen"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <div className="w-px bg-white/20 mx-1" />

        {/* Überschriften */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Überschrift groß"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Überschrift klein"
        >
          H3
        </ToolbarButton>

        <div className="w-px bg-white/20 mx-1" />

        {/* Listen */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Aufzählung"
        >
          • Liste
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Nummerierte Liste"
        >
          1. Liste
        </ToolbarButton>

        <div className="w-px bg-white/20 mx-1" />

        {/* Ausrichtung */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Linksbündig"
        >
          ←
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Zentriert"
        >
          ↔
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Rechtsbündig"
        >
          →
        </ToolbarButton>

        <div className="w-px bg-white/20 mx-1" />

        {/* Farben */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-white/40 text-xs">Farbe:</span>
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => editor.chain().focus().setColor(c.value).run()}
              className="w-5 h-5 rounded-full border border-white/30 hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value }}
            />
          ))}
          <button
            type="button"
            title="Farbe zurücksetzen"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs text-white/40 hover:text-white/70 px-1"
          >
            ✕
          </button>
        </div>

        <div className="w-px bg-white/20 mx-1" />

        {/* Markierung */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#f97316" }).run()}
          active={editor.isActive("highlight")}
          title="Text markieren (orange)"
        >
          <span className="bg-orange-500/40 px-1 rounded">Mark</span>
        </ToolbarButton>

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const previousUrl = editor.getAttributes("link").href || "";
                setLinkUrl(previousUrl);
                setShowLinkInput((v) => !v);
              }
            }}
            active={editor.isActive("link")}
            title={editor.isActive("link") ? "Link entfernen" : "Link einfügen"}
          >
            🔗 Link
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-gray-900 border border-white/20 rounded-lg p-2 shadow-xl flex gap-2 min-w-[280px]">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (linkUrl) {
                      editor.chain().focus().setLink({ href: linkUrl }).run();
                    } else {
                      editor.chain().focus().unsetLink().run();
                    }
                    setShowLinkInput(false);
                    setLinkUrl("");
                  }
                  if (e.key === "Escape") {
                    setShowLinkInput(false);
                    setLinkUrl("");
                  }
                }}
                placeholder="https://... oder /raum36"
                className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder-white/30 outline-none focus:border-orange-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (linkUrl) {
                    editor.chain().focus().setLink({ href: linkUrl }).run();
                  } else {
                    editor.chain().focus().unsetLink().run();
                  }
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
                className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded hover:bg-white/20"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Alles löschen */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Formatierung entfernen"
        >
          ✕ Format
        </ToolbarButton>
      </div>

      {/* Editor-Bereich */}
      <div
        className="p-3 text-white/90"
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        {!value && !editor.isFocused && (
          <div className="absolute text-white/30 pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/**
 * Zeigt gespeichertes HTML sicher an (für Nutzer-Ansicht).
 * Verwendet prose-Klassen für konsistentes Styling.
 */
export function RichTextDisplay({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const [, navigate] = useLocation();

  if (!html) return null;

  // Interne Links (beginnen mit /) werden über den Router navigiert (kein Reload).
  // Externe Links öffnen in neuem Tab.
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const eventTarget = e.target as HTMLElement;
    const anchor = eventTarget.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") || "";
    if (href.startsWith("/")) {
      e.preventDefault();
      e.stopPropagation();
      // target=_blank entfernen damit kein neuer Tab öffnet
      anchor.removeAttribute("target");
      navigate(href);
    }
    // Externe Links: Browser-Standard (target=_blank) greift
  };

  return (
    <div
      className={cn(
        "prose prose-invert max-w-none text-white/90",
        "[&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2",
        "[&_h3]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mb-1 [&_p]:mb-2 [&_strong]:text-white [&_em]:text-white/80",
        "[&_mark]:rounded [&_mark]:px-0.5",
        "[&_a]:text-orange-400 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-orange-300",
        className
      )}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
