import Table from '@material-ui/core/Table';
import styled from 'styled-components';

export const StyledTable = styled(Table)`
    color: ${(p) => p.theme.colors.gray[600]};
    padding: 10px;
    border: 0px;
    .MuiTableCell-root {
        max-height: 38px;
        padding: 9px 6px;
    }
`;

export const TrPlaceholder = styled.tr<{ height: number }>`
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdYAAAAvCAIAAADRknxoAAAAA3NCSVQICAjb4U/gAAAAGXRFWHRTb2Z0d2FyZQBnbm9tZS1zY3JlZW5zaG907wO/PgAAAPZJREFUeJzt2rENgzAQQNEQsQATsP9YTMAITpE6naWfxO81dNYJnb4sxDbGeABQeNYDAKxLggEyEgyQkWCAzP5+XNfVzgGwmvM8N39EAFR8iADISDBARoIBMhIMkJFggIwEA2QkGCAjwQAZCQbISDBARoIBMhIMkJFggIwEA2T2ucfd9z33wLmO46hH+OjLX92f+eZN+HUrbPLE/XELBshIMEBGggEyEgyQkWCAjAQDZCQYICPBABkJBshIMEBGggEyEgyQkWCAjAQDZCQYICPBABkJBshsY4x6BoBFuQUDZCQYICPBABkJBshIMEBGggEyEgyQeQFcVBVXDK0d1QAAAABJRU5ErkJggg==');
    background-repeat: repeat-y;
    height: ${(p) => p.height}px;
`;
