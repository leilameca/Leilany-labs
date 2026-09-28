"use client";
import { T, L, usePreferences, translate } from "@/components/preferences";


import { useEffect, useRef, useState } from "react";
import { ToolArtwork } from "@/components/tool-artwork";
import { categories, chapters, libraryTools, type Category, type LibraryTool } from "@/experiments/library";
import styles from "./lab.module.css";

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function ToolsLibrary() {
  const { language } = usePreferences();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LibraryTool | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const words = normalized(query).trim().split(/\s+/).filter(Boolean);
  const matching = libraryTools.filter(tool => {
    const source = [tool.number, tool.title, tool.description, tool.question, tool.keywords, ...tool.inputs, ...tool.outputs];
    const text = normalized([...source, ...source.map(value => translate(value, language))].join(" "));
    return words.every(word => text.includes(word));
  });
  const visible = matching.filter(tool => category === "all" || tool.category === category);
  const isFiltered = category !== "all" || query.trim().length > 0;

  useEffect(() => {
    if (!selected) return;
    const element = dialog.current;
    if (!element?.open) element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  function reset() {
    setQuery("");
    setCategory("all");
    search.current?.focus();
  }

  function closePreview() {
    setSelected(null);
    opener.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <div className={styles.discovery}>
        <L as="div" className={styles.categories} role="group" aria-label="Filter experiments by category">
          <T>{categories.map(item => (
            <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
              <T>{item.label}</T><span><T>{matching.filter(tool => item.id === "all" || tool.category === item.id).length}</T></span>
            </button>
          ))}</T>
        </L>
        <div className={styles.searchBox}>
          <label htmlFor="tool-search"><T>{"Find a tool"}</T></label>
          <L as="input" id="tool-search" ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try sunlight, a room, a budget..." autoComplete="off" />
          <T>{query && <button type="button" onClick={() => { setQuery(""); search.current?.focus(); }}><T>{"Clear"}</T></button>}</T>
        </div>
      </div>
      <div className={styles.collectionNote}>
        <p role="status" aria-live="polite" aria-atomic="true"><T>{visible.length}</T> <T>{visible.length === 1 ? "experiment" : "experiments"}</T><T>{isFiltered ? " found" : " to explore"}</T></p>
        <span><T>{"Open a working tool or preview what is coming next."}</T></span>
      </div>
      <T>{visible.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyMark} aria-hidden="true"><T>{"?"}</T></span>
          <h2><T>{"No experiments found."}</T></h2>
          <p><T>{"Try a different word or explore the full collection."}</T></p>
          <button className={styles.solidButton} type="button" onClick={reset}><T>{"Show all experiments"}</T></button>
        </div>
      ) : chapters.map(chapter => {
        const tools = visible.filter(tool => tool.category === chapter.id);
        if (!tools.length) return null;
        return (
          <section className={styles.chapter} key={chapter.id} aria-labelledby={`chapter-${chapter.id}`}>
            <div className={styles.chapterHeading}>
              <div><p className={styles.eyebrow}><T>{categories.find(item => item.id === chapter.id)?.label}</T></p><h2 id={`chapter-${chapter.id}`}><T>{chapter.title}</T></h2></div>
              <p><T>{chapter.description}</T></p>
            </div>
            <div className={`${styles.shelf} ${styles[chapter.id]}`}>
              <T>{tools.map(tool => (
                <article key={tool.slug} className={`${styles.tool} ${styles[tool.kind]}`} data-tool={tool.slug}>
                  <div className={styles.art}>
                    <span className={styles.number}><T>{tool.number}</T></span>
                    <ToolArtwork kind={tool.kind} />
                    <span className={styles.unit}><T>{tool.unit}</T></span>
                    <T>{tool.kind === "solar" && <span className={styles.solarGreeting}><T>{"Hello, sunshine."}</T></span>}</T>
                  </div>
                  <div className={styles.toolCopy}>
                    <T>{tool.kind === "solar" && <span className={styles.firstUp}><T>{"FIRST UP IN THE LAB"}</T></span>}</T>
                    <h3><T>{tool.title}</T></h3>
                    <p className={styles.tagline}><T>{tool.tagline}</T></p>
                    <p className={styles.description}><T>{tool.description}</T></p>
                    <T>{tool.availability === "available" ? <L as="a" className={styles.previewButton} href={tool.href} aria-label={`Open ${tool.title}`}><T>{" Open tool "}</T><span aria-hidden="true"><T>{"→"}</T></span>
                    </L> : <L as="button" className={styles.previewButton} type="button" aria-label={`Explore ${tool.title} preview`} aria-haspopup="dialog" onClick={event => { opener.current = event.currentTarget; setSelected(tool); }}><T>{" Explore preview "}</T><span aria-hidden="true"><T>{"→"}</T></span>
                    </L>}</T>
                  </div>
                </article>
              ))}</T>
            </div>
          </section>
        );
      })}</T>
      <div className={styles.endnote}><span><T>{"A question becomes an experiment."}</T></span><p><T>{"Built with logic. Made with personality."}</T></p></div>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="preview-title" aria-describedby="preview-description" onClose={closePreview} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <T>{selected && (
          <div className={styles.dialogContent}>
            <div className={styles.dialogTop}><span><T>{selected.number}</T><T>{" / CONCEPT PREVIEW"}</T></span><form method="dialog"><button type="submit" autoFocus><T>{"Close "}</T><span aria-hidden="true"><T>{"×"}</T></span></button></form></div>
            <div className={`${styles.dialogArt} ${styles[selected.kind]}`}><div className={styles.art}><ToolArtwork kind={selected.kind} /><span className={styles.unit}><T>{selected.unit}</T></span></div></div>
            <div className={styles.dialogCopy}>
              <h2 id="preview-title"><T>{selected.title}</T></h2>
              <p id="preview-description" className={styles.question}><T>{selected.question}</T></p>
              <div className={styles.previewScope}>
                <div><h3><T>{"Starts with"}</T></h3><ul><T>{selected.inputs.map(item => <li key={item}><T>{item}</T></li>)}</T></ul></div>
                <div><h3><T>{"Helps you explore"}</T></h3><ul><T>{selected.outputs.map(item => <li key={item}><T>{item}</T></li>)}</T></ul></div>
              </div>
              <p className={styles.comingSoon}><T>{"In the making. This is a look at the idea; the working tool is still to come."}</T></p>
              <div className={styles.dialogFooter}><span><T>{selected.slug === "solarcalc" ? "First experiment planned" : "Planned experiment"}</T></span><button type="button" onClick={() => setSelected(visible[(visible.findIndex(tool => tool.slug === selected.slug) + 1) % visible.length])} disabled={visible.length < 2}><T>{"Next preview "}</T><span aria-hidden="true"><T>{"→"}</T></span></button></div>
            </div>
          </div>
        )}</T>
      </dialog>
    </>
  );
}
