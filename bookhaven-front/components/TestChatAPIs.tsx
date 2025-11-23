import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { ChatService } from '../lib/api/chat';
import { useAuth } from '../contexts/AuthContext';

export default function TestChatAPIs() {
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [testResults, setTestResults] = useState<string[]>([]);

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const testHealthAPI = async () => {
        try {
            addTestResult('🔍 Testing health API...');
            const response = await fetch('http://localhost:3001/api/health');
            const data = await response.json();
            addTestResult('✅ Health API working: ' + JSON.stringify(data));
        } catch (error) {
            addTestResult('❌ Health API error: ' + error);
        }
    };

    const testSearchUsers = async () => {
        if (!token) {
            addTestResult('❌ No token available');
            return;
        }

        try {
            addTestResult('🔍 Testing user search...');
            const users = await ChatService.searchUsers(searchQuery || 'alice', token);
            addTestResult('✅ Found users: ' + JSON.stringify(users, null, 2));
        } catch (error) {
            addTestResult('❌ User search error: ' + error);
        }
    };

    const testGetConversations = async () => {
        if (!token) {
            addTestResult('❌ No token available');
            return;
        }

        try {
            addTestResult('🔍 Testing get conversations...');
            const conversations = await ChatService.getConversations(token);
            addTestResult('✅ Found conversations: ' + JSON.stringify(conversations, null, 2));
        } catch (error) {
            addTestResult('❌ Conversations error: ' + error);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat API Test</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search query (default: alice)"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={testHealthAPI}>
                    <Text style={styles.buttonText}>Test Health</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={testSearchUsers}>
                    <Text style={styles.buttonText}>Search Users</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={testGetConversations}>
                    <Text style={styles.buttonText}>Get Conversations</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.resultsContainer}>
                {testResults.map((result, index) => (
                    <Text key={index} style={styles.resultText}>
                        {result}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: 'white',
        fontSize: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        minWidth: '45%',
    },
    clearButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resultText: {
        fontSize: 12,
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});