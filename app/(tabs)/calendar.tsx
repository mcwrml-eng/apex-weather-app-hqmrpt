
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '../../styles/commonStyles';
import { getAllCalendarEvents, CalendarEvent } from '../../data/schedules';
import { getCircuitBySlug } from '../../data/circuits';
import Icon from '../../components/Icon';
import { router } from 'expo-router';

type CategoryFilter = 'all' | 'f1' | 'motogp';

export default function CalendarScreen() {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '70%'], []);

  const events = useMemo<CalendarEvent[]>(
    () => getAllCalendarEvents(filter, (slug, category) => getCircuitBySlug(slug, category)),
    [filter]
  );

  const byDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!e.date) continue;
      map[e.date] = map[e.date] || [];
      map[e.date].push(e);
    }
    // sort each date's events by time
    Object.keys(map).forEach((d) => {
      map[d] = map[d].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    });
    return map;
  }, [events]);

  const markedDates = useMemo(() => {
    const marks: any = {};
    Object.keys(byDate).forEach((d) => {
      const hasF1 = byDate[d].some((e) => e.category === 'f1');
      const hasMoto = byDate[d].some((e) => e.category === 'motogp');
      const dots = [];
      if (hasF1) dots.push({ color: colors.primary });
      if (hasMoto) dots.push({ color: colors.accent });
      marks[d] = {
        marked: true,
        dots,
        selected: selectedDate === d,
        selectedColor: selectedDate === d ? colors.secondary : undefined,
      };
    });
    if (selectedDate && !marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: colors.secondary };
    }
    return marks;
  }, [byDate, selectedDate]);

  const onDayPress = useCallback((day: DateObject) => {
    const d = day.dateString;
    setSelectedDate(d);
    if (byDate[d]) {
      sheetRef.current?.expand();
    } else {
      // If no events, just close
      sheetRef.current?.close();
    }
  }, [byDate]);

  const selectedEvents = selectedDate ? byDate[selectedDate] || [] : [];

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Race weekends with local times</Text>

        <View style={styles.segment}>
          <SegmentButton text="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <SegmentButton text="F1" active={filter === 'f1'} onPress={() => setFilter('f1')} />
          <SegmentButton text="MotoGP" active={filter === 'motogp'} onPress={() => setFilter('motogp')} />
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>F1</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendText}>MotoGP</Text>
          </View>
        </View>
      </View>

      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          calendarBackground: colors.background,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          textMonthFontWeight: '700',
          textSectionTitleColor: colors.textMuted,
          todayTextColor: colors.secondary,
          selectedDayBackgroundColor: colors.secondary,
          selectedDayTextColor: '#fff',
          arrowColor: colors.text,
        }}
        style={styles.calendar}
      />

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>
            {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
          </Text>
          <Text style={styles.muted}>Local track times. Subject to change.</Text>
          <View style={{ height: 12 }} />
          {selectedEvents.length === 0 ? (
            <Text style={styles.muted}>No sessions on this day.</Text>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedEvents.map((e) => (
                <TouchableOpacity
                  key={`${e.circuitSlug}-${e.key}`}
                  onPress={() => {
                    router.push({ pathname: '/circuit/[slug]', params: { slug: e.circuitSlug, category: e.category } });
                  }}
                  style={styles.sessionItem}
                  activeOpacity={0.8}
                >
                  <View style={[styles.sessionDot, { backgroundColor: e.category === 'f1' ? colors.primary : colors.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionTitle}>{e.title}</Text>
                    <Text style={styles.sessionSub}>
                      {e.time} • {e.circuitName} • {e.category.toUpperCase()}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

function SegmentButton({ text, active, onPress }: { text: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, fontFamily: 'Roboto_700Bold' },
  subtitle: { color: colors.textMuted, marginTop: 4, fontFamily: 'Roboto_400Regular' },
  segment: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.card,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  segmentText: { color: colors.textMuted, fontFamily: 'Roboto_500Medium' },
  segmentTextActive: { color: colors.text, fontFamily: 'Roboto_700Bold' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textMuted, fontFamily: 'Roboto_400Regular' },
  calendar: {
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
  } as any,
  sheet: { padding: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, fontFamily: 'Roboto_700Bold' },
  muted: { color: colors.textMuted, fontFamily: 'Roboto_400Regular' },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sessionDot: { width: 10, height: 10, borderRadius: 5 },
  sessionTitle: { color: colors.text, fontFamily: 'Roboto_700Bold' },
  sessionSub: { color: colors.textMuted, fontFamily: 'Roboto_400Regular', marginTop: 2 },
});
