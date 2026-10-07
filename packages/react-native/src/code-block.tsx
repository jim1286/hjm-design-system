import type{ReactNode}from'react';import{ScrollView,Text,View}from'react-native';
import{resolveCodeBlock,type CodeBlockDescriptor}from'@hjmds/design-contracts/code-block';
import{spacing}from'@hjmds/design-contracts/foundations';import{useHjmNativeTheme}from'./provider.js';
import {resolveNativeFontStyle,resolveNativeTextScaleProps} from './internal/styles.js';
export type CodeBlockProps=CodeBlockDescriptor & Readonly<{copyAction?:ReactNode}>;
/** Product supplies its clipboard action; importing this view installs no Expo/native clipboard dependency. */
export function CodeBlock({copyAction,...descriptor}:CodeBlockProps){const spec=resolveCodeBlock(descriptor);const {colors,textScaling,tokens}=useHjmNativeTheme();
// Keep a single selectable source with inherited token spans; native Text alone
// ignores the provider's controlled text scale used by both showcases.
const textProps=resolveNativeTextScaleProps(textScaling,tokens.typography.body);
// Code punctuation must keep its reading order independently of an RTL product shell.
const source=<Text {...textProps} selectable accessibilityLabel={`${spec.label}\n${spec.code}`} style={[textProps.style,{...resolveNativeFontStyle(tokens.fontFamily.code,"code"),writingDirection:'ltr',textAlign:'left',color:colors.text,padding:spacing.md}]}>{spec.tokens.map((token,index)=><Text key={index} style={{color:token.tone==='comment'?colors.textMuted:token.tone==='keyword'||token.tone==='number'?colors.primary:colors.text}}>{token.text}</Text>)}</Text>;return <View style={{minWidth:0,borderRadius:tokens.radius.lg,backgroundColor:colors.surfaceAlt,overflow:'hidden'}}><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.sm,padding:spacing.md}}><Text {...textProps} style={[textProps.style,{...resolveNativeFontStyle(tokens.fontFamily.ui),color:colors.text}]}>{spec.language??spec.label}</Text>{copyAction}</View>{spec.wrap?source:<ScrollView horizontal>{source}</ScrollView>}</View>;}
