"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  type JSONContent,
  EditorCommandList,
  EditorBubble,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { defaultExtensions } from "./extensions";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";
import { TextButtons } from "./selectors/text-buttons";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { uploadFn } from "./image-upload";
import { Separator } from "../ui/separator";
import { useSlashCommand } from "@/components/editor/slash-command"; // Import the new hook
import { useParams, useRouter } from 'next/navigation'
import { useLiveStateData, useSetLiveStateData, useLiveState} from '@veltdev/react';

interface EditorProp {
  initialValue?: JSONContent;
  onChange: (value: JSONContent) => void;
}

interface EditorLiveState {
  content: JSONContent;
}

const Editor = ({ initialValue, onChange }: EditorProp) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const router = useRouter();
  const params = useParams<{ ksuid: string; }>()
  const ksuid = params.ksuid;

  const liveStateDataId = ksuid;
  const initialLiveStateData: EditorLiveState = { content: {} as JSONContent };
  
  const [editorContent, setEditorContent] = useLiveState<EditorLiveState>(liveStateDataId, initialLiveStateData);
  const { slashCommand, suggestionItems } = useSlashCommand(); // Use the new hook

  
  useSetLiveStateData(liveStateDataId, initialLiveStateData);
  
  const extensions = useMemo(() => [...defaultExtensions, slashCommand], [slashCommand]);

  return (
    <EditorRoot>
      <EditorContent
        className="border p-4 rounded-xl text-black"
        initialContent={initialValue || editorContent.content}
        extensions={extensions}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) =>
            handleImageDrop(view, event, moved, uploadFn),
          attributes: {
            class: `prose prose-lg prose-headings:font-title font-default focus:outline-none max-w-full text-black`,
          },
        }}
        onUpdate={({ editor }) => {
          const jsonContent = editor.getJSON();
          onChange(jsonContent);
          setEditorContent({ content: jsonContent });
        }}
        slotAfter={<ImageResizer />}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-white px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-black">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-gray-100 aria-selected:bg-gray-100 text-black`}
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-black">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-black">{item.title}</p>
                  <p className="text-xs text-black">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <EditorBubble
          tippyOptions={{
            placement: "top",
          }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl text-black"
        >
          <Separator orientation="vertical" />
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <Separator orientation="vertical" />
          <TextButtons />
          <Separator orientation="vertical" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          <Separator orientation="vertical" />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
};

export default Editor;