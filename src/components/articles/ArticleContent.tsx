import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function ArticleContent({ content }: { content: string }) {
  return (
    <div
      className="
        max-w-none
        [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-text
        [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-text
        [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted
        [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted
        [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-muted
        [&_li]:mt-1
        [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
        [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_blockquote]:italic
        [&_code]:font-mono [&_code]:text-sm
        [&_:not(pre)>code]:border [&_:not(pre)>code]:border-border [&_:not(pre)>code]:bg-panel [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5
        [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-panel [&_pre]:p-4
        [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
        [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:text-text
        [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:text-muted
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
