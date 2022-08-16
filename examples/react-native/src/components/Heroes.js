import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    while (color.length < 7) color += letters[Math.floor(Math.random() * 16)];
    return color;
};

export const Heroes = () => {
    const { db } = useAppContext();
    const [name, setName] = useState('');
    const [heroes, setHeroes] = useState([]);

    useEffect(() => {
        let sub;
        if (db.heroes) {
            sub = db.heroes
                .find()
                .sort({ name: 1 })
                .$.subscribe((rxdbHeroes) => {
                    setHeroes(rxdbHeroes);
                });
        }
        return () => {
            if (sub && sub.unsubscribe) sub.unsubscribe();
        };
    }, [db]);

    const addHero = async (name) => {
        console.log('addHero: ' + name);
        const color = getRandomColor();
        console.log('color: ' + color);
        await db.heroes.insert({ name, color });
        setName('');
    };

    const removeHero = async (hero) => {
        Alert.alert(
            'Delete hero?',
            `Are you sure you want to delete ${hero.get('name')}`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: async () => {
                        console.log('removeHero: ' + hero.get('name'));
                        const doc = db.heroes.findOne({
                            selector: {
                                name: hero.get('name'),
                            },
                        });
                        await doc.remove();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.topContainer}>
            <StatusBar backgroundColor="#55C7F7" barStyle="light-content"/>
            <Text style={styles.title}>React native rxdb example</Text>

            <ScrollView style={styles.heroesList}>
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={(name) => setName(name)}
                        placeholder="Type to add a hero..."
                        onSubmitEditing={() => addHero(name)}
                    />
                    {name.length > 1 && (
                        <TouchableOpacity onPress={() => addHero(name)}>
                            <Image
                                style={styles.plusImage}
                                source={require('./plusIcon.png')}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                {heroes.length === 0 && <Text style={styles.placeholder}>No heroes to display ...</Text>}
                {heroes.map((hero, index) => (
                    <View style={styles.card} key={index}>
                        <View
                            style={[
                                styles.colorBadge,
                                {
                                    backgroundColor: hero.get('color'),
                                },
                            ]}
                        />
                        <Text style={styles.heroName}>{hero.get('name')}</Text>
                        <TouchableOpacity
                            onPress={() => removeHero(hero)}
                            style={styles.alignRight}
                        >
                            <Image
                                style={styles.deleteImage}
                                source={require('../../assets/deleteIcon.png')}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'center',
        backgroundColor: '#55C7F7',
        flex: 1,
    },
    title: {
        marginTop: 20,
        fontSize: 25,
        color: 'white',
        fontWeight: '500',
    },
    heroesList: {
        marginTop: 24,
        borderRadius: 5,
        flex: 1,
        width: width - 30,
        paddingLeft: 15,
        marginHorizontal: 15,
        backgroundColor: 'white',
    },
    plusImage: {
        width: 30,
        height: 30,
        marginRight: 15,
        marginLeft: 'auto',
    },
    deleteImage: {
        width: 30,
        height: 30,
        marginRight: 15,
    },
    alignRight: {
        marginLeft: 'auto',
    },
    input: {
        flex: 1,
        color: '#D2DCE1',
    },
    placeholder: {
        padding: 15,
    },
    card: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',

        marginLeft: 12,
        paddingVertical: 15,
        borderBottomColor: '#D2DCE1',
        borderBottomWidth: 0.5,
    },
    colorBadge: {
        height: 30,
        width: 30,
        borderRadius: 15,
        marginRight: 15,
    },
    heroName: {
        fontSize: 18,
        fontWeight: '200',
        marginTop: 3,
    },
});

export default Heroes;
