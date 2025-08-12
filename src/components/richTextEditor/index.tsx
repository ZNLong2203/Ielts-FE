"use client";
import "./index.css";
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import MenuBar from "./menuBar";
import { cn } from "@/lib/utils";

interface RichTextFieldProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  minHeight?: string;
}

const RichTextField = ({
  content = "",
  onChange,
  placeholder = "Start typing...",
  className,
  editable = true,
  minHeight = "200px",
}: RichTextFieldProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'prose-headings',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'prose-bullets',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'prose-ordered',
          },
        },
      }),
      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "table-black-border",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "table-row-black",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "table-header-black",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "table-cell-black",
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const newContent = editor.getHTML();
        if (newContent !== content) {
          onChange(newContent);
        }
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4",
          "min-h-[200px] max-w-none",
          // Ensure headings are styled properly
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3",
          "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2",
          "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2",
          "[&_h5]:text-base [&_h5]:font-semibold [&_h5]:mt-2 [&_h5]:mb-1",
          "[&_h6]:text-sm [&_h6]:font-semibold [&_h6]:mt-2 [&_h6]:mb-1",
          // Lists styling
          "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:my-2",
          "[&_li]:my-1",
          // Other elements
          "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_p]:my-2",
          className
        ),
        placeholder,
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]);

  // Debug effect to check if editor is working
  useEffect(() => {
    if (editor) {
      console.log("Editor initialized successfully");
      console.log("Editor commands available:", Object.keys(editor.commands));
    }
  }, [editor]);

  if (!editor) {
    return <div className="border rounded-lg p-4 bg-gray-100">Loading editor...</div>;
  }


  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <div className="border-t" style={{ minHeight }}>
        <EditorContent
          editor={editor}
          className="rich-text-editor"
        />
      </div>

      {/* CSS tùy chỉnh cho table màu đen */}
      <style jsx>{`
        .rich-text-editor .table-black-border table {
          border-collapse: collapse;
          border: 2px solid #000000;
        }

        .rich-text-editor .table-cell-black,
        .rich-text-editor .table-header-black {
          border: 1px solid #000000 !important;
        }

        .rich-text-editor .table-header-black {
          background-color: #f8f9fa;
          font-weight: bold;
        }

        .rich-text-editor table {
          border: 2px solid #000000 !important;
        }

        .rich-text-editor table td,
        .rich-text-editor table th {
          border: 1px solid #000000 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextField;
