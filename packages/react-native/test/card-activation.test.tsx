import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, StyleSheet, View } from "react-native";
import { expect, it, vi } from "vitest";
import { Card } from "../src/data-display.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("keeps header commands outside the card target and measures their reservation", () => {
  const open = vi.fn(), report = vi.fn(); let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider><Card title="Idea" accessibilityLabel="Open idea" onActivate={open}
    headerActions={<Pressable accessibilityLabel="Report idea" onPress={report} />} /></HjmNativeProvider>); });
  const controls = renderer.root.findAllByType(Pressable);
  const command = controls.find(node => node.props.accessibilityLabel === "Report idea")!;
  const opener = controls.find(node => node.props.accessibilityLabel === "Open idea")!;
  expect(opener.findAllByProps({ accessibilityLabel: "Report idea" })).toHaveLength(0);
  act(() => command.parent!.props.onLayout({ nativeEvent: { layout: { width: 104, height: 44 } } }));
  expect(opener.findAllByType(View).some(node => {
    const style = StyleSheet.flatten(node.props.style);
    return style?.marginEnd > 104 && style?.minHeight === 44;
  })).toBe(true);
  act(() => command.props.onPress());
  expect(report).toHaveBeenCalledOnce(); expect(open).not.toHaveBeenCalled();
  act(() => opener.props.onPress()); expect(open).toHaveBeenCalledOnce();
  act(() => renderer.unmount());
});

it("keeps a header command centered as the copy wraps and the row resizes", () => {
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider><Card description="Organize apps and folders"
    headerActions={<Pressable accessibilityLabel="Edit" />} /></HjmNativeProvider>); });
  const command = () => renderer.root.findByProps({ accessibilityLabel: "Edit" }).parent!;
  act(() => command().props.onLayout({ nativeEvent: { layout: { width: 44, height: 44 } } }));
  const row = () => renderer.root.findAllByType(View).find(node => StyleSheet.flatten(node.props.style)?.marginEnd === 56)!;
  for (const height of [44, 80, 52]) {
    act(() => row().props.onLayout({ nativeEvent: { layout: { y: 16, height } } }));
    const commandTop = StyleSheet.flatten(command().props.style).top;
    expect(commandTop + 22).toBe(16 + height / 2);
    expect(StyleSheet.flatten(row().props.style).alignItems).toBe("center");
  }
  act(() => renderer.unmount());
});

it("announces whole-card selection and guards disabled actions while allowing reapplication", () => {
  const onActivate = vi.fn();
  let renderer!: ReactTestRenderer;
  const card = (disabled: boolean) => <HjmNativeProvider theme="light"><Card accessibilityLabel="Timer" selected disabled={disabled} onActivate={onActivate} /></HjmNativeProvider>;
  act(() => { renderer = create(card(false)); });
  const action = renderer.root.findByType(Pressable);
  expect(action.props.accessibilityRole).toBe("button");
  expect(action.props.accessibilityState).toEqual({ selected: true, disabled: false });
  act(() => { action.props.onPress(); action.props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(2);
  act(() => { renderer.update(card(true)); });
  act(() => { renderer.root.findByType(Pressable).props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(2);
  act(() => { renderer.unmount(); });
});

it("keeps ordinary cards passive", () => {
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider theme="light"><Card title="Summary" /></HjmNativeProvider>); });
  expect(renderer.root.findAllByType(Pressable)).toHaveLength(0);
  act(() => { renderer.unmount(); });
});

it("keeps actions as sibling targets beside the whole-card activation", () => {
  const onActivate = vi.fn();
  const onDelete = vi.fn();
  let renderer!: ReactTestRenderer;
  const card = (disabled: boolean) => <HjmNativeProvider theme="light"><Card accessibilityLabel="KE123 Seoul to Tokyo" title="ICN → NRT" disabled={disabled} onActivate={onActivate}
    actions={<Pressable accessibilityRole="button" accessibilityLabel="Delete KE123" onPress={onDelete} />} /></HjmNativeProvider>;
  act(() => { renderer = create(card(false)); });
  const [activation, remove] = renderer.root.findAllByType(Pressable);
  expect(activation!.props.accessibilityLabel).toBe("KE123 Seoul to Tokyo");
  expect(activation!.props.accessibilityRole).toBe("button");
  // The delete control is not a descendant of the activation target, so screen readers reach it on its own.
  expect(activation!.findAllByType(Pressable).filter(node => node !== activation)).toHaveLength(0);
  expect(remove!.props.accessibilityLabel).toBe("Delete KE123");
  act(() => { activation!.props.onPress(); remove!.props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledTimes(1);
  act(() => { renderer.update(card(true)); });
  const [disabledActivation, stillRemove] = renderer.root.findAllByType(Pressable);
  expect(disabledActivation!.props.accessibilityState).toEqual({ selected: false, disabled: true });
  act(() => { disabledActivation!.props.onPress(); stillRemove!.props.onPress(); });
  expect(onActivate).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledTimes(2);
  act(() => { renderer.unmount(); });
});

it("keeps cover activation separate from creator/footer controls and disables only the cover", () => {
 const open=vi.fn(), author=vi.fn(), comment=vi.fn(); let renderer!:ReactTestRenderer;
 const card=(disabled:boolean)=><HjmNativeProvider><Card title="Title" disabled={disabled} media={<View testID="cover" />}
  mediaAction={{label:"Play",onActivate:open,icon:({color,size})=><View testID="play-icon" style={{backgroundColor:color,width:size}}/>}}
  actions={<Pressable accessibilityLabel="Comment" onPress={comment}/>}><Pressable accessibilityLabel="Author" onPress={author}/></Card></HjmNativeProvider>;
 act(()=>{renderer=create(card(false));});
 const byLabel=(label:string)=>renderer.root.findAllByType(Pressable).find(node=>node.props.accessibilityLabel===label)!;
 expect(byLabel("Play").findAllByType(Pressable).filter(node=>node!==byLabel("Play"))).toHaveLength(0);
 act(()=>{byLabel("Play").props.onPress();byLabel("Author").props.onPress();byLabel("Comment").props.onPress();});
 expect(open).toHaveBeenCalledOnce();expect(author).toHaveBeenCalledOnce();expect(comment).toHaveBeenCalledOnce();
 act(()=>renderer.update(card(true)));act(()=>{byLabel("Play").props.onPress();byLabel("Author").props.onPress();});
 expect(open).toHaveBeenCalledOnce();expect(author).toHaveBeenCalledTimes(2);
 expect(byLabel("Play").props.accessibilityState.disabled).toBe(true);
 act(()=>renderer.unmount());
});

it("hides decorative background artwork without swallowing independent actions", () => {
  const open = vi.fn(); let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider><Card backgroundMedia={<View testID="artwork-only" />} title="Title"
    badges={<View testID="badge" />} actions={<Pressable accessibilityLabel="Open" onPress={open} />} /></HjmNativeProvider>); });
  const background = renderer.root.findByProps({ testID: "artwork-only" }).parent!;
  expect(background.props.accessibilityElementsHidden).toBe(true);
  expect(background.props.pointerEvents).toBe("none");
  const command = renderer.root.findByType(Pressable);
  expect(command.props.accessibilityLabel).toBe("Open");
  act(() => command.props.onPress()); expect(open).toHaveBeenCalledOnce();
  act(() => renderer.unmount());
});


it("keeps adjustable cover navigation independent from corner badges and content commands", () => {
  const adjust = vi.fn(), comment = vi.fn(); let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider><Card backgroundMedia={<View testID="art" />}
    backgroundInteraction={<View testID="gesture" accessible accessibilityRole="adjustable" onAccessibilityAction={adjust} />}
    mediaBadges={<View testID="classification" />} title="Title"
    actions={<Pressable accessibilityLabel="Comment" onPress={comment} />} /></HjmNativeProvider>); });
  const gesture = renderer.root.findByProps({ testID: "gesture" });
  expect(gesture.parent!.props.pointerEvents).toBe("box-none");
  expect(gesture.parent!.props.accessibilityElementsHidden).not.toBe(true);
  expect(renderer.root.findByProps({ testID: "classification" }).parent!.props.pointerEvents).toBe("box-none");
  act(() => gesture.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
  act(() => renderer.root.findByType(Pressable).props.onPress());
  expect(adjust).toHaveBeenCalledOnce(); expect(comment).toHaveBeenCalledOnce();
  act(() => renderer.unmount());
});


it("takes corner labels out of layout while preserving whole-card activation", () => {
  const open = vi.fn(); let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<HjmNativeProvider><Card title="Turtle" accessibilityLabel="Open turtle" onActivate={open}
    badgesPlacement="corner" badges={<View testID="new-label" />} /></HjmNativeProvider>); });
  const label = renderer.root.findByProps({ testID: "new-label" });
  const style = StyleSheet.flatten(label.parent!.props.style);
  expect(style.position).toBe("absolute");
  expect(style.top).toBe(8);
  expect(style.right).toBe(8);
  expect(style.transform).toEqual([{ rotate: "12deg" }]);
  expect(label.parent!.props.pointerEvents).toBe("none");
  act(() => renderer.root.findByType(Pressable).props.onPress());
  expect(open).toHaveBeenCalledOnce();
  act(() => renderer.unmount());
});
