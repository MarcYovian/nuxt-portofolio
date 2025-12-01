<script setup lang="ts">
const props = withDefaults(defineProps<{
    name: string
    email: string
    subject: string
    message: string
    sentDate: string
}>(), {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Project Inquiry',
    message: 'Hello, I would like to discuss a project with you.',
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
    buttonSection: {
        textAlign: 'center' as const,
        marginTop: '32px',
    },
    button: {
        backgroundColor: theme.primary,
        color: '#000000',
        padding: '12px 32px',
        borderRadius: '6px',
        fontWeight: '600',
        textDecoration: 'none',
        fontSize: '14px',
        display: 'inline-block',
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
            <EPreview>New message from {{ name }} - {{ subject }}</EPreview>

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
                        <EHeading as="h1" :style="styles.h1">New Message Received</EHeading>
                        <EText :style="styles.subtext">
                            You have received a new inquiry from your portfolio contact form.
                        </EText>
                    </ESection>

                    <EHr :style="styles.divider" />

                    <!-- Details -->
                    <ESection>
                        <ESection :style="styles.detailRow">
                            <EText :style="styles.label">From</EText>
                            <EText :style="styles.value">{{ name }} &lt;{{ email }}&gt;</EText>
                        </ESection>

                        <ESection :style="styles.detailRow">
                            <EText :style="styles.label">Date</EText>
                            <EText :style="styles.value">{{ sentDate }}</EText>
                        </ESection>

                        <ESection :style="styles.detailRow">
                            <EText :style="styles.label">Subject</EText>
                            <EText :style="styles.value">{{ subject }}</EText>
                        </ESection>

                        <ESection :style="styles.detailRow">
                            <EText :style="styles.label">Message</EText>
                            <ESection :style="styles.messageBox">
                                <EText :style="styles.messageText">{{ message }}</EText>
                            </ESection>
                        </ESection>
                    </ESection>

                    <!-- Action -->
                    <ESection :style="styles.buttonSection">
                        <EButton :href="`mailto:${email}?subject=Re: ${subject}`" :style="styles.button">
                            Reply via Email
                        </EButton>
                    </ESection>
                </ESection>

                <!-- Footer -->
                <ESection :style="styles.footer">
                    <EText :style="styles.footerText">
                        © {{ new Date().getFullYear() }} MarcYovian. All rights reserved.
                    </EText>
                    <EText :style="styles.footerText">
                        This email was sent from your portfolio website.
                    </EText>
                </ESection>
            </EContainer>
        </EBody>
    </EHtml>
</template>