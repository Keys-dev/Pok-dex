import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView, StyleSheet, Text, Image, View,
  TouchableOpacity, useWindowDimensions
} from "react-native";
import { colorsByType } from "./index";

interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
  stats: PokemonStat[];
}

export default function Details() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions(); // ✅ track screen width

  // ✅ responsive breakpoints
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const maxWidth = isDesktop ? 900 : isTablet ? 700 : "100%";
  const spriteSize = isDesktop ? 200 : isTablet ? 180 : 150;

  useEffect(() => {
    fetchPokemonByName(name as string).then((data) => {
      if (!data) return;
      setPokemon({
        name: data.name,
        image: data.sprites.front_default,
        imageBack: data.sprites.back_default,
        types: data.types,
        stats: data.stats,
      });
    });
  }, [name]);

  async function fetchPokemonByName(name: string) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching pokemon details:", error);
    }
  }

  if (!pokemon) return <Text style={{ padding: 20 }}>Loading...</Text>;

  const primaryType = pokemon.types[0].type.name;
  const bgColor = colorsByType[primaryType] ?? "#ccc";

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>

      {/* ✅ Centered container with max width */}
      <View style={[styles.container, { maxWidth: maxWidth as any }]}>

        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* ✅ On desktop: side-by-side layout for card + stats */}
        <View style={[styles.contentRow, { flexDirection: isDesktop ? "row" : "column" }]}>

          {/* Header card */}
          <View style={[
            styles.card,
            { backgroundColor: bgColor + "50" },
            isDesktop && { flex: 1 } // ✅ takes half width on desktop
          ]}>
            <Text style={styles.name}>{pokemon.name}</Text>

            {/* Type badges */}
            <View style={styles.badgeRow}>
              {pokemon.types.map((t) => (
                <View
                  key={t.type.name}
                  style={[styles.badge, { backgroundColor: colorsByType[t.type.name] ?? "#ccc" }]}
                >
                  <Text style={styles.badgeText}>{t.type.name}</Text>
                </View>
              ))}
            </View>

            {/* ✅ Sprites scale with screen size */}
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              <Image
                source={{ uri: pokemon.image }}
                style={{ width: spriteSize, height: spriteSize }}
              />
              <Image
                source={{ uri: pokemon.imageBack }}
                style={{ width: spriteSize, height: spriteSize }}
              />
            </View>
          </View>

          {/* Stats card */}
          <View style={[
            styles.statsCard,
            isDesktop && { flex: 1 } // ✅ takes other half on desktop
          ]}>
            <Text style={styles.statsTitle}>Base Stats</Text>
            {pokemon.stats.map((s) => (
              <View key={s.stat.name} style={styles.statRow}>
                <Text style={[
                  styles.statName,
                  isTablet && { width: 120, fontSize: 14 } // ✅ wider label on tablet+
                ]}>
                  {s.stat.name}
                </Text>
                <View style={styles.statBarBg}>
                  <View
                    style={[
                      styles.statBarFill,
                      {
                        width: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
                        backgroundColor: bgColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  styles.statValue,
                  isTablet && { fontSize: 14 }
                ]}>
                  {s.base_stat}
                </Text>
              </View>
            ))}
          </View>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  contentRow: {
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "capitalize",
  },
  statsCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statName: {
    width: 90,
    fontSize: 12,
    textTransform: "capitalize",
    color: "#555",
  },
  statBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  statValue: {
    width: 30,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
});