/// Beta Flutter adapter of HJM's screen-pattern and composition contracts.
/// ThemeData remains product-owned; geometry and state presentation live here.
library;

import 'package:flutter/material.dart';

enum HjmStateKind { loading, empty, error, restricted }

/// Matches screenPatternRecipe: md=16, sm=12, readingMaxWidth=720.
abstract final class HjmLayout {
  static const double padding = 16;
  static const double gap = 12;
  static const double readingMaxWidth = 720;
}

class HjmContentState extends StatelessWidget {
  const HjmContentState({super.key, required this.kind, required this.title,
    this.description, this.leading, this.action});
  final HjmStateKind kind;
  final String title;
  final String? description;
  final Widget? leading;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    assert(title.trim().isNotEmpty);
    final theme = Theme.of(context);
    final group = Padding(
      padding: const EdgeInsets.all(HjmLayout.padding),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        if (kind == HjmStateKind.loading)
          CircularProgressIndicator(semanticsLabel: [title, description].nonNulls.join('. '))
        else ...[
          if (leading != null) ...[leading!, const SizedBox(height: HjmLayout.padding)],
          Text(title, textAlign: TextAlign.center, style: theme.textTheme.titleMedium),
          if (description != null) ...[
            const SizedBox(height: HjmLayout.gap),
            Text(description!, textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
          ],
        ],
        if (action != null) ...[const SizedBox(height: HjmLayout.padding), action!],
      ]),
    );
    // Use the owning viewport when bounded, and intrinsic panel height in a scroll.
    // Overflow still scrolls instead of clipping the retry action.
    return Semantics(liveRegion: true, child: LayoutBuilder(builder: (context, constraints) =>
      SingleChildScrollView(child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: constraints.hasBoundedHeight ? constraints.maxHeight : 0),
        child: Center(child: group),
      )),
    ));
  }
}

class HjmCompositionLayout extends StatelessWidget {
  const HjmCompositionLayout({super.key, this.title, this.description,
    this.leading, this.badge, this.actions, this.notice, this.child, this.footer});
  final String? title;
  final String? description;
  final Widget? leading;
  final Widget? badge;
  final Widget? actions;
  final Widget? notice;
  final Widget? child;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final header = title != null || description != null || leading != null || badge != null || actions != null;
    return Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: HjmLayout.padding, children: [
        if (header) Row(crossAxisAlignment: CrossAxisAlignment.center, spacing: HjmLayout.gap, children: [
          if (leading != null) leading!,
          Expanded(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 4, children: [
              Wrap(spacing: HjmLayout.gap, crossAxisAlignment: WrapCrossAlignment.center, children: [
                if (title != null) Semantics(header: true, child: Text(title!, style: theme.textTheme.titleMedium)),
                if (badge != null) badge!,
              ]),
              if (description != null) Text(description!, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
            ])),
          if (actions != null) Flexible(child: actions!),
        ]),
        if (notice != null) notice!,
        if (child != null) child!,
        if (footer != null) footer!,
      ]);
  }
}

class HjmScreenLayout extends StatelessWidget {
  const HjmScreenLayout({super.key, required this.title, required this.body,
    this.actions, this.footer, this.showHeader = true, this.transparent = false});
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? footer;
  final bool showHeader;
  final bool transparent;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: transparent ? Colors.transparent : null,
    appBar: showHeader ? AppBar(title: Text(title), actions: actions) : null,
    body: body,
    bottomNavigationBar: footer,
  );
}

class HjmListRow extends StatelessWidget {
  const HjmListRow({super.key, required this.title, this.description, this.metadata,
    this.leading, this.trailing, this.onTap, this.selected = false, this.semanticLabel});
  final String title;
  final String? description;
  final String? metadata;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool selected;
  final String? semanticLabel;
  @override
  Widget build(BuildContext context) => Semantics(
    label: semanticLabel, excludeSemantics: semanticLabel != null,
    button: onTap != null, selected: selected, onTap: semanticLabel == null ? null : onTap,
    // ListTile paints ink on Material; own it so product decoration cannot cover interactions.
    child: Material(type: MaterialType.transparency, child: ListTile(title: Text(title),
      subtitle: description == null && metadata == null ? null : Text([metadata, description].nonNulls.join('\n')),
      leading: leading, trailing: trailing, onTap: onTap, selected: selected,
      contentPadding: const EdgeInsets.symmetric(horizontal: HjmLayout.padding, vertical: 4),
    )),
  );
}

/// Color is domain/brand input; shape, padding and icon/label placement are shared.
class HjmBadge extends StatelessWidget {
  const HjmBadge({super.key, required this.label, this.icon, this.color, this.solid = false});
  final String label;
  final IconData? icon;
  final Color? color;
  final bool solid;
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = color ?? theme.colorScheme.primary;
    final foreground = solid ? theme.colorScheme.onPrimary : accent;
    return DecoratedBox(decoration: BoxDecoration(
      color: solid ? accent : accent.withValues(alpha: .08),
      borderRadius: BorderRadius.circular(8),
    ), child: Padding(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(mainAxisSize: MainAxisSize.min, spacing: 4, children: [
        if (icon != null) Icon(icon, size: 14, color: foreground),
        Flexible(child: Text(label, style: theme.textTheme.labelSmall?.copyWith(color: foreground))),
      ]),
    ));
  }
}

enum HjmActionTone { primary, secondary, danger }

class HjmActionButton extends StatelessWidget {
  const HjmActionButton({super.key, required this.label, required this.onPressed,
    this.icon, this.tone = HjmActionTone.primary});
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final HjmActionTone tone;
  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final (background, foreground) = switch (tone) {
      HjmActionTone.primary => (colors.primary, colors.onPrimary),
      HjmActionTone.secondary => (colors.surfaceContainerHighest, colors.onSurface),
      HjmActionTone.danger => (colors.error, colors.onError),
    };
    final style = FilledButton.styleFrom(backgroundColor: background, foregroundColor: foreground,
      minimumSize: const Size.fromHeight(52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)));
    return icon == null ? FilledButton(onPressed: onPressed, style: style, child: Text(label))
      : FilledButton.icon(onPressed: onPressed, style: style, icon: Icon(icon), label: Text(label));
  }
}

class HjmConfirmDialog extends StatelessWidget {
  const HjmConfirmDialog({super.key, required this.title, required this.description,
    required this.cancelLabel, required this.confirmLabel, required this.onCancel, required this.onConfirm});
  final String title;
  final String description;
  final String cancelLabel;
  final String confirmLabel;
  final VoidCallback onCancel;
  final VoidCallback onConfirm;
  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(title), content: Text(description), actions: [
      TextButton(onPressed: onCancel, child: Text(cancelLabel)),
      FilledButton(onPressed: onConfirm,
        style: FilledButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.error,
          foregroundColor: Theme.of(context).colorScheme.onError), child: Text(confirmLabel)),
    ],
  );
}

/// Shared modal body owns keyboard clearance, safe area and scrolling.
/// The product still owns showModalBottomSheet's result and dismissal policy.
class HjmSheetLayout extends StatelessWidget {
  const HjmSheetLayout({super.key, required this.child, this.scrollKey});
  final Widget child;
  final Key? scrollKey;
  @override
  Widget build(BuildContext context) => AnimatedPadding(
    duration: const Duration(milliseconds: 180), curve: Curves.easeOutCubic,
    padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
    child: SafeArea(top: false, child: SingleChildScrollView(key: scrollKey,
      padding: const EdgeInsets.all(HjmLayout.padding), child: child)),
  );
}

class HjmActionGroup extends StatelessWidget {
  const HjmActionGroup({super.key, required this.primary, required this.secondary});
  final Widget primary;
  final Widget secondary;
  @override
  Widget build(BuildContext context) => Row(spacing: HjmLayout.gap, children: [
    Expanded(child: secondary), Expanded(flex: 2, child: primary),
  ]);
}
