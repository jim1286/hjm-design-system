import 'dart:ui' show SemanticsAction;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hjm_flutter/hjm_flutter.dart';

void main() {
  testWidgets('state centers in its region and retains retry', (tester) async {
    var retries = 0;
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: SizedBox(width: 300, height: 400,
      child: HjmContentState(kind: HjmStateKind.error, title: 'Failed', description: 'Try again',
        action: TextButton(onPressed: () => retries++, child: const Text('Retry')))))));
    final title = tester.getCenter(find.text('Failed'));
    expect(title.dx, closeTo(150, 1));
    expect(title.dy, greaterThan(140));
    expect(title.dy, lessThan(220));
    await tester.tap(find.text('Retry'));
    expect(retries, 1);
  });
  testWidgets('loading hides visible copy and exposes semantic label', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body:
      HjmContentState(kind: HjmStateKind.loading, title: 'Loading'))));
    expect(find.text('Loading'), findsNothing);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
  testWidgets('composition preserves a separate title action and body', (tester) async {
    var calls = 0;
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: HjmCompositionLayout(
      title: 'Trip', badge: const HjmBadge(label: 'Ready'),
      actions: TextButton(onPressed: () => calls++, child: const Text('Edit')),
      child: const Text('Map'),
    ))));
    await tester.tap(find.text('Edit'));
    expect(calls, 1);
    expect(find.text('Map'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('localized row label keeps the accessibility tap action', (tester) async {
    final handle = tester.ensureSemantics();
    var calls = 0;
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: DecoratedBox(decoration: const BoxDecoration(color: Colors.white), child: HjmListRow(
      title: 'Station', semanticLabel: 'Station, Seoul', selected: true, onTap: () => calls++,
    )))));
    final node = tester.getSemantics(find.bySemanticsLabel('Station, Seoul'));
    expect(node.getSemanticsData().hasAction(SemanticsAction.tap), isTrue);
    await tester.tap(find.text('Station'));
    expect(calls, 1);
    handle.dispose();
  });

}
