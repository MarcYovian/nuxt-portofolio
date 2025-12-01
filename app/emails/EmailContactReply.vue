<script setup lang="ts">
const props = withDefaults(defineProps<{
    name: string
    subject: string
    replyMessage: string
    originalMessage: string
    sentDate: string
}>(), {
    name: 'John Doe',
    subject: 'Re: Project Inquiry',
    replyMessage: 'Thank you for your message. I am interested.',
    originalMessage: 'Hello, I would like to discuss a project with you.',
    sentDate: 'January 1, 2025 at 10:00 AM'
})

// Premium Dark Theme Palette (Zinc & Amber)
const theme = {
    bg: '#09090b', // Zinc 950
    cardBg: '#18181b', // Zinc 900
    border: '#27272a', // Zinc 800
    textMain: '#e4e4e7', // Zinc 200
    textMuted: '#a1a1aa', // Zinc 400
    primary: '#f59e0b', // Amber 500
    primaryHover: '#d97706', // Amber 600
    divider: '#27272a', // Zinc 800
}

const mainFont = {
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const styles = {
    main: {
        backgroundColor: theme.bg,
        color: theme.textMain,
        ...mainFont,
    },
    container: {
        margin: '0 auto',
        padding: '40px 20px',
        maxWidth: '600px',
    },
    logoSection: {
        textAlign: 'center' as const,
        marginBottom: '32px',
    },
    logoText: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: theme.textMain,
        textDecoration: 'none',
        letterSpacing: '-0.5px',
    },
    logoAccent: {
        color: theme.primary,
    },
    card: {
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        overflow: 'hidden',
        padding: '40px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    header: {
        marginBottom: '24px',
        textAlign: 'center' as const,
    },
    h1: {
        color: theme.textMain,
        fontSize: '20px',
        fontWeight: '600',
        margin: '0 0 8px',
        lineHeight: '1.4',
    },
    subtext: {
        color: theme.textMuted,
        fontSize: '14px',
        margin: '0',
    },
    divider: {
        borderColor: theme.divider,
        margin: '24px 0',
    },
    detailRow: {
        marginBottom: '16px',
    },
    label: {
        color: theme.textMuted,
        fontSize: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        fontWeight: '600',
        marginBottom: '4px',
        display: 'block',
    },
    value: {
        color: theme.textMain,
        fontSize: '15px',
        fontWeight: '500',
        margin: '0',
    },
    messageBox: {
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '20px',
        marginTop: '8px',
    },
    messageText: {
        color: theme.textMain,
        fontSize: '15px',
        lineHeight: '1.6',
        margin: '0',
        whiteSpace: 'pre-wrap' as const,
    },
    originalMessageBox: {
        backgroundColor: 'rgba(39, 39, 42, 0.5)', // Zinc 800 with opacity
        borderLeft: `3px solid ${theme.primary}`,
        padding: '16px',
        marginTop: '24px',
        borderRadius: '4px',
    },
    originalMessageText: {
        color: theme.textMuted,
        fontSize: '14px',
        fontStyle: 'italic',
        lineHeight: '1.5',
        margin: '0',
        whiteSpace: 'pre-wrap' as const,
    },
    footer: {
        textAlign: 'center' as const,
        marginTop: '32px',
    },
    footerText: {
        color: theme.textMuted,
        fontSize: '12px',
        margin: '0 0 8px',
    },
    link: {
        color: theme.primary,
        textDecoration: 'none',
    },
}
</script>

<template>
    <EHtml>
        <EHead />
        <EBody :style="styles.main">
            <EPreview>Reply to your message: {{ subject }}</EPreview>

            <EContainer :style="styles.container">
                <!-- Logo -->
                <ESection :style="styles.logoSection">
                    <EText :style="styles.logoText">
                        Marc<span :style="styles.logoAccent">Yovian</span>
                    </EText>
                </ESection>

                <!-- Main Card -->
                <ESection :style="styles.card">
                    <!-- Header -->
                    <ESection :style="styles.header">
                        <EHeading as="h1" :style="styles.h1">Response to your Inquiry</EHeading>
                        <EText :style="styles.subtext">
                            Hello {{ name }}, here is the response to your message.
                        </EText>
                    </ESection>

                    <EHr :style="styles.divider" />

                    <!-- Reply Message -->
                    <ESection :style="styles.detailRow">
                        <EText :style="styles.label">Reply</EText>
                        <ESection :style="styles.messageBox">
                            <EText :style="styles.messageText">{{ replyMessage }}</EText>
                        </ESection>
                    </ESection>

                    <!-- Original Message Context -->
                    <ESection :style="styles.originalMessageBox">
                        <EText :style="styles.label" style="margin-bottom: 8px;">In reply to your message:</EText>
                        <EText :style="styles.originalMessageText">"{{ originalMessage }}"</EText>
                    </ESection>

                </ESection>

                <!-- Footer -->
                <ESection :style="styles.footer">
                    <EText :style="styles.footerText">
                        © {{ new Date().getFullYear() }} MarcYovian. All rights reserved.
                    </EText>
                    <EText :style="styles.footerText">
                        If you have any further questions, please feel free to reply to this email.
                    </EText>
                </ESection>
            </EContainer>
        </EBody>
    </EHtml>
</template>
